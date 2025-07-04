/**
 * Framework Hierarchy Processor
 *
 * This utility processes Excel data to create proper parent-child relationships
 * for framework attributes before inserting them into the database.
 *
 * The main goal is to ensure attributes with the same value in the same column
 * get the same parent ID, creating a proper hierarchical structure.
 */

export interface ProcessedAttribute {
  name: string
  value: string
  rowIndex: number
  colIndex: number
  parentKey?: string // Unique key for finding parent
  tempId?: string // Temporary ID for processing
}

export interface AttributeHierarchy {
  attributes: ProcessedAttribute[]
  hierarchyMap: Map<string, string> // Maps attribute keys to their parent keys
  uniqueAttributes: Map<string, ProcessedAttribute> // Unique attributes by key
}

/**
 * Creates a unique key for an attribute based on its column and value
 */
function createAttributeKey(colIndex: number, value: string): string {
  return `col_${colIndex}_${value.toLowerCase().trim()}`
}

/**
 * Creates a parent key for an attribute based on its position in the hierarchy
 */
function createParentKey(
  colIndex: number,
  rowIndex: number,
  attributes: ProcessedAttribute[],
): string | undefined {
  if (colIndex === 0) return undefined // First column has no parent

  // Find the parent in the previous column for the same row
  const parentAttr = attributes.find(
    (attr) => attr.rowIndex === rowIndex && attr.colIndex === colIndex - 1,
  )

  if (!parentAttr) return undefined

  return createAttributeKey(parentAttr.colIndex, parentAttr.value)
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
  const hierarchyMap = new Map<string, string>()
  const uniqueAttributes = new Map<string, ProcessedAttribute>()

  // Sort attributes by row and column to ensure proper processing order
  const sortedAttributes = [...rawAttributes].sort((a, b) => {
    if (a.rowIndex !== b.rowIndex) return a.rowIndex - b.rowIndex
    return a.colIndex - b.colIndex
  })

  // First pass: Create processed attributes with parent keys
  for (const attr of sortedAttributes) {
    const attributeKey = createAttributeKey(attr.colIndex, attr.value)
    const parentKey = createParentKey(
      attr.colIndex,
      attr.rowIndex,
      sortedAttributes,
    )

    const processedAttr: ProcessedAttribute = {
      ...attr,
      parentKey,
      tempId: attributeKey, // Use key as temp ID
    }

    processedAttributes.push(processedAttr)

    // Store hierarchy relationship
    if (parentKey) {
      hierarchyMap.set(attributeKey, parentKey)
    }

    // Store unique attributes (avoid duplicates)
    if (!uniqueAttributes.has(attributeKey)) {
      uniqueAttributes.set(attributeKey, processedAttr)
    }
  }

  return {
    attributes: processedAttributes,
    hierarchyMap,
    uniqueAttributes,
  }
}

/**
 * Filters attributes to remove duplicates while preserving hierarchy
 */
function getUniqueAttributesForInsertion(
  hierarchy: AttributeHierarchy,
): ProcessedAttribute[] {
  const uniqueForInsertion: ProcessedAttribute[] = []
  const processedKeys = new Set<string>()

  // Process by column level to ensure parents are created before children
  const columnLevels = new Map<number, ProcessedAttribute[]>()

  // Group by column level
  for (const attr of hierarchy.uniqueAttributes.values()) {
    const colIndex = attr.colIndex
    if (!columnLevels.has(colIndex)) {
      columnLevels.set(colIndex, [])
    }
    columnLevels.get(colIndex)!.push(attr)
  }

  // Process each column level in order
  const sortedColumns = Array.from(columnLevels.keys()).sort((a, b) => a - b)

  for (const colIndex of sortedColumns) {
    const columnAttributes = columnLevels.get(colIndex)!

    for (const attr of columnAttributes) {
      const attributeKey = createAttributeKey(attr.colIndex, attr.value)

      if (!processedKeys.has(attributeKey)) {
        uniqueForInsertion.push(attr)
        processedKeys.add(attributeKey)
      }
    }
  }

  return uniqueForInsertion
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

  for (const created of createdAttributes) {
    const key = createAttributeKey(created.colIndex, created.value)
    idMapping.set(key, created.id)
  }

  return idMapping
}

/**
 * Gets the parent ID for an attribute based on the hierarchy and ID mapping
 */
export function getParentId(
  attribute: ProcessedAttribute,
  hierarchy: AttributeHierarchy,
  idMapping: Map<string, string>,
): string | null {
  if (!attribute.parentKey) return null

  return idMapping.get(attribute.parentKey) || null
}

/**
 * Validates the hierarchy structure
 */
function validateHierarchy(hierarchy: AttributeHierarchy): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check for orphaned children (children without existing parents)
  for (const [childKey, parentKey] of hierarchy.hierarchyMap.entries()) {
    if (!hierarchy.uniqueAttributes.has(parentKey)) {
      errors.push(
        `Child "${childKey}" references non-existent parent "${parentKey}"`,
      )
    }
  }

  // Check for circular references
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function hasCircularReference(key: string): boolean {
    if (recursionStack.has(key)) return true
    if (visited.has(key)) return false

    visited.add(key)
    recursionStack.add(key)

    const parentKey = hierarchy.hierarchyMap.get(key)
    if (parentKey && hasCircularReference(parentKey)) {
      return true
    }

    recursionStack.delete(key)
    return false
  }

  for (const key of hierarchy.uniqueAttributes.keys()) {
    if (hasCircularReference(key)) {
      errors.push(`Circular reference detected involving "${key}"`)
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

    // Get unique attributes for insertion
    const attributesForInsertion = getUniqueAttributesForInsertion(hierarchy)

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
