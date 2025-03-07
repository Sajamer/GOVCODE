import dotenv from 'dotenv'
import connectToMongoDB from '../../lib/mongodb'

// Load environment variables
dotenv.config()

async function testConnection() {
  try {
    const mongoose = await connectToMongoDB()
    console.log('✅ Database connection test successful')

    if (!mongoose.connection || !mongoose.connection.db) {
      throw new Error('Database connection not properly initialized')
    }

    // Test the connection by making a simple query
    const collections = await mongoose.connection.db.collections()
    console.log(
      '📁 Available collections:',
      collections.map((c) => c.collectionName),
    )

    await mongoose.connection.close()
    console.log('🔒 Connection closed successfully')
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    process.exit(1)
  }
}

// Run the test immediately if this file is executed directly
if (require.main === module) {
  testConnection()
}

export default testConnection
