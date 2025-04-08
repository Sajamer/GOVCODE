import connectToMongoDB from '../../src/lib/mongodb'
import AttributeType from '../../src/models/attributeType.model'

const attributeTypes = [
  { name: 'date', description: 'Date value' },
  { name: 'number', description: 'Numeric value' },
  { name: 'text', description: 'Text value' },
  { name: 'Yes/No', description: 'Boolean value' },
  { name: 'Object', description: 'Object value' },
  { name: 'Attachment', description: 'File attachment' },
  { name: 'Array', description: 'Array of values' },
  { name: 'List', description: 'Comma-separated list of values' },
]

export async function seedAttributeTypes() {
  try {
    await connectToMongoDB()
    
    // Clear existing attribute types
    await AttributeType.deleteMany({})
    
    // Insert new attribute types
    await AttributeType.insertMany(attributeTypes)
    
    console.log('✅ Attribute types seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding attribute types:', error)
    throw error
  }
}