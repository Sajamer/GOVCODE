/**
 * Framework Data Processing Utilities for UI Components
 *
 * These utilities are specifically designed for processing framework data
 * in UI components like FrameworkLinkDialog.
 */

export interface UIFrameworkAttribute {
  id: string
  name?: string
  value?: string | null
  colIndex?: number
  rowIndex?: number
  parentId?: string | null
}

export interface UINestedAttribute {
  id: string
  name?: string
  value?: string | null
  colIndex?: number
  rowIndex?: number
  parentId?: string | null
  children?: UINestedAttribute[] | null
}

/**
 * Creates a nested structure from framework attributes for UI display
 * This function handles the legacy structure where parent-child relationships
 * might not be properly established in the database.
 */
export function createUINestedStructure(framework: {
  attributes: UIFrameworkAttribute[]
}): UINestedAttribute[] {
  // If we have proper parent-child relationships, use them
  const hasProperParents = framework.attributes.some((attr) => attr.parentId)

  if (hasProperParents) {
    return createProperNestedStructure(framework)
  }

  // Fallback to position-based hierarchy for legacy data
  return createPositionBasedStructure(framework)
}

/**
 * Creates nested structure using proper parent-child relationships
 */
function createProperNestedStructure(framework: {
  attributes: UIFrameworkAttribute[]
}): UINestedAttribute[] {
  // Create a map for quick attribute lookup
  const attributeMap = new Map<string, UIFrameworkAttribute>()
  framework.attributes.forEach((attr) => {
    attributeMap.set(attr.id, attr)
  })

  // Build children for each attribute
  const buildChildren = (parentId: string): UINestedAttribute[] => {
    const children = framework.attributes
      .filter((attr) => attr.parentId === parentId)
      .map((attr) => ({
        ...attr,
        children: buildChildren(attr.id),
      }))
      .sort((a, b) => {
        // Sort by column first, then by row
        if ((a.colIndex || 0) !== (b.colIndex || 0)) {
          return (a.colIndex || 0) - (b.colIndex || 0)
        }
        return (a.rowIndex || 0) - (b.rowIndex || 0)
      })

    return children
  }

  // Find root attributes (those without parents)
  const rootAttributes = framework.attributes
    .filter((attr) => !attr.parentId)
    .map((attr) => ({
      ...attr,
      children: buildChildren(attr.id),
    }))
    .sort((a, b) => {
      // Sort by column first, then by row
      if ((a.colIndex || 0) !== (b.colIndex || 0)) {
        return (a.colIndex || 0) - (b.colIndex || 0)
      }
      return (a.rowIndex || 0) - (b.rowIndex || 0)
    })

  return rootAttributes
}

/**
 * Creates nested structure based on position for legacy data
 */
function createPositionBasedStructure(framework: {
  attributes: UIFrameworkAttribute[]
}): UINestedAttribute[] {
  // Group attributes by column index
  const attributesByColumn: Record<number, UIFrameworkAttribute[]> = {}
  framework.attributes.forEach((attr) => {
    const colIndex = attr.colIndex || 0
    if (!attributesByColumn[colIndex]) {
      attributesByColumn[colIndex] = []
    }
    attributesByColumn[colIndex].push(attr)
  })

  // Get sorted column indices
  const sortedColumns = Object.keys(attributesByColumn)
    .map(Number)
    .sort((a, b) => a - b)

  if (sortedColumns.length === 0) return []

  // Start with first column attributes as root nodes
  const firstColumnAttributes = attributesByColumn[sortedColumns[0]] || []
  const uniqueFirstColumn = firstColumnAttributes.filter(
    (attr, index, array) =>
      array.findIndex(
        (a) => (a.value || a.name) === (attr.value || attr.name),
      ) === index,
  )

  const buildChildrenFromPosition = (
    parentAttr: UIFrameworkAttribute,
    currentColIndex: number,
  ): UINestedAttribute[] => {
    if (currentColIndex >= sortedColumns.length - 1) return []

    const nextColIndex = sortedColumns[currentColIndex + 1]
    if (nextColIndex === undefined) return []

    // Find children in the next column that logically belong to this parent
    const children = getChildAttributesForParentByPosition(
      framework,
      parentAttr,
      nextColIndex,
    )

    return children.map((child) => ({
      ...child,
      children: buildChildrenFromPosition(child, currentColIndex + 1),
    }))
  }

  return uniqueFirstColumn.map((parent) => ({
    ...parent,
    children: buildChildrenFromPosition(
      parent,
      sortedColumns.findIndex((col) => col === (parent.colIndex || 0)),
    ),
  }))
}

/**
 * Gets child attributes for a specific parent based on position
 */
function getChildAttributesForParentByPosition(
  framework: { attributes: UIFrameworkAttribute[] },
  parentAttr: UIFrameworkAttribute,
  targetColIndex: number,
): UIFrameworkAttribute[] {
  const parentIndex = framework.attributes.findIndex(
    (attr) => attr.id === parentAttr.id,
  )

  if (parentIndex === -1) return []

  const children = []
  // Look for attributes in the target column that come after this parent
  for (let i = parentIndex + 1; i < framework.attributes.length; i++) {
    const attr = framework.attributes[i]

    // Stop if we hit a new main section (colIndex <= parent.colIndex)
    if (
      attr.colIndex !== undefined &&
      parentAttr.colIndex !== undefined &&
      attr.colIndex <= parentAttr.colIndex
    ) {
      break
    }

    // Add attributes that match the target column
    if (attr.colIndex === targetColIndex) {
      children.push(attr)
    }
  }

  // Remove duplicates based on value or name
  return children.filter(
    (attr, index, array) =>
      array.findIndex(
        (a) => (a.value || a.name) === (attr.value || attr.name),
      ) === index,
  )
}

/**
 * Gets the display value for an attribute
 */
export function getUIAttributeDisplayValue(
  attr: UIFrameworkAttribute | UINestedAttribute,
): string {
  return attr.value || attr.name || 'Unnamed'
}

/**
 * Checks if an attribute has children
 */
export function hasChildren(attr: UINestedAttribute): boolean {
  return Boolean(attr.children && attr.children.length > 0)
}

/**
 * Gets all leaf nodes (attributes without children) from a nested structure
 */
export function getUILeafAttributes(
  nestedAttributes: UINestedAttribute[],
): UINestedAttribute[] {
  const leafAttributes: UINestedAttribute[] = []

  function traverse(attributes: UINestedAttribute[]) {
    for (const attr of attributes) {
      if (!hasChildren(attr)) {
        leafAttributes.push(attr)
      } else {
        traverse(attr.children!)
      }
    }
  }

  traverse(nestedAttributes)
  return leafAttributes
}
