/**
 * Framework Hierarchy Processor
 *
 * This utility processes Excel data to create proper parent-child relationships
 * for framework attributes before inserting them into the database.
 *
 * For compliance frameworks:
 * - Columns 0-2: Only unique values are inserted (no duplicates)
 * - Last column: Each instance is inserted with correct parent relationship
 */

export interface ProcessedAttribute {
  name: string
  value: string
  rowIndex: number
  colIndex: number
  parentValue?: string // Value of parent in previous column
  isLastColumn?: boolean // Whether this is the last column (evidence)
}

export interface AttributeHierarchy {
  attributes: ProcessedAttribute[]
  uniqueAttributesByColumn: Map<number, Map<string, ProcessedAttribute>> // Column -> Value -> Attribute
}

/**
 * Creates a unique key for an attribute based on its column and value
 */
function createAttributeKey(colIndex: number, value: string): string {
  return `col_${colIndex}_${value.toLowerCase().trim()}`
}

/**
 * Processes raw Excel data to create a proper hierarchical structure
 */
function processFrameworkHierarchy(
  rawAttributes: Array<{
    name: string
    value: string
    rowIndex: number
    colIndex: number
  }>,
): AttributeHierarchy {
  const processedAttributes: ProcessedAttribute[] = []
  const uniqueAttributesByColumn = new Map<
    number,
    Map<string, ProcessedAttribute>
  >()

  // Find the maximum column index to determine the last column
  const maxColIndex = Math.max(...rawAttributes.map((attr) => attr.colIndex))

  // Sort attributes by row and column to ensure proper processing order
  const sortedAttributes = [...rawAttributes].sort((a, b) => {
    if (a.rowIndex !== b.rowIndex) return a.rowIndex - b.rowIndex
    return a.colIndex - b.colIndex
  })

  // Group attributes by row for easier parent-child relationship processing
  const attributesByRow = new Map<number, Array<(typeof rawAttributes)[0]>>()
  for (const attr of sortedAttributes) {
    if (!attributesByRow.has(attr.rowIndex)) {
      attributesByRow.set(attr.rowIndex, [])
    }
    attributesByRow.get(attr.rowIndex)!.push(attr)
  }

  // Process each row to build the hierarchy
  for (const rowAttributes of attributesByRow.values()) {
    // Sort by column index
    const sortedRowAttributes = rowAttributes.sort(
      (a, b) => a.colIndex - b.colIndex,
    )

    for (const attr of sortedRowAttributes) {
      const isLastColumn = attr.colIndex === maxColIndex

      // For non-last columns, only add unique values
      if (!isLastColumn) {
        if (!uniqueAttributesByColumn.has(attr.colIndex)) {
          uniqueAttributesByColumn.set(attr.colIndex, new Map())
        }

        const columnMap = uniqueAttributesByColumn.get(attr.colIndex)!
        const valueKey = attr.value.toLowerCase().trim()

        if (!columnMap.has(valueKey)) {
          const parentValue =
            attr.colIndex > 0
              ? sortedRowAttributes.find(
                  (a) => a.colIndex === attr.colIndex - 1,
                )?.value
              : undefined

          const processedAttr: ProcessedAttribute = {
            ...attr,
            parentValue,
            isLastColumn: false,
          }

          columnMap.set(valueKey, processedAttr)
          processedAttributes.push(processedAttr)
        }
      } else {
        // For last column (evidence), add each instance with its parent
        const parentValue = sortedRowAttributes.find(
          (a) => a.colIndex === attr.colIndex - 1,
        )?.value

        const processedAttr: ProcessedAttribute = {
          ...attr,
          parentValue,
          isLastColumn: true,
        }

        processedAttributes.push(processedAttr)
      }
    }
  }

  return {
    attributes: processedAttributes,
    uniqueAttributesByColumn,
  }
}

/**
 * Gets all attributes ready for database insertion
 */
function getAttributesForInsertion(
  hierarchy: AttributeHierarchy,
): ProcessedAttribute[] {
  return hierarchy.attributes
}

/**
 * Creates a mapping of attribute keys to their database IDs after insertion
 */
export function createIdMapping(
  uniqueAttributes: ProcessedAttribute[],
  createdAttributes: Array<{
    id: string
    name: string
    value: string
    colIndex: number
  }>,
): Map<string, string> {
  const idMapping = new Map<string, string>()

  // For each created attribute, find the corresponding unique attribute
  // and map by row index to handle duplicates properly
  for (let i = 0; i < createdAttributes.length; i++) {
    const created = createdAttributes[i]
    const uniqueAttr = uniqueAttributes[i] // They should be in the same order

    if (uniqueAttr) {
      // Create a unique key that includes row context for duplicates
      const key = `col_${created.colIndex}_${created.value.toLowerCase().trim()}_row_${uniqueAttr.rowIndex}`
      idMapping.set(key, created.id)

      // Also create a simple key for non-duplicate items (backwards compatibility)
      const simpleKey = `col_${created.colIndex}_${created.value.toLowerCase().trim()}`
      if (!idMapping.has(simpleKey)) {
        idMapping.set(simpleKey, created.id)
      }
    }
  }

  return idMapping
}

/**
 * Gets the parent ID for an attribute based on its parent value
 */
export function getParentId(
  attribute: ProcessedAttribute,
  hierarchy: AttributeHierarchy,
  idMapping: Map<string, string>,
): string | null {
  if (!attribute.parentValue || attribute.colIndex === 0) return null

  const parentKey = createAttributeKey(
    attribute.colIndex - 1,
    attribute.parentValue,
  )
  return idMapping.get(parentKey) || null
}

/**
 * Validates the hierarchy structure (simplified for compliance framework)
 */
function validateHierarchy(hierarchy: AttributeHierarchy): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Basic validation - ensure we have attributes
  if (hierarchy.attributes.length === 0) {
    errors.push('No attributes found in hierarchy')
  }

  // Validate that each non-first column has a parent value
  for (const attr of hierarchy.attributes) {
    if (attr.colIndex > 0 && !attr.parentValue) {
      errors.push(
        `Attribute "${attr.value}" in column ${attr.colIndex} has no parent`,
      )
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Main function to process and prepare framework data for database insertion
 */
export function prepareFrameworkDataForInsertion(
  rawAttributes: Array<{
    name: string
    value: string
    rowIndex: number
    colIndex: number
  }>,
): {
  success: boolean
  data?: {
    hierarchy: AttributeHierarchy
    attributesForInsertion: ProcessedAttribute[]
  }
  errors?: string[]
} {
  try {
    // Process the hierarchy
    const hierarchy = processFrameworkHierarchy(rawAttributes)

    // Validate the hierarchy
    const validation = validateHierarchy(hierarchy)
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      }
    }

    // Get attributes for insertion
    const attributesForInsertion = getAttributesForInsertion(hierarchy)

    return {
      success: true,
      data: {
        hierarchy,
        attributesForInsertion,
      },
    }
  } catch (error) {
    return {
      success: false,
      errors: [
        error instanceof Error ? error.message : 'Unknown processing error',
      ],
    }
  }
}
