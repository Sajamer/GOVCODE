import connectToMongoDB from '../lib/mongodb'

async function testConnection() {
  try {
    const mongoose = await connectToMongoDB()
    console.log('Database connection test successful')

    // Check if connection and db are defined
    if (!mongoose.connection || !mongoose.connection.db) {
      throw new Error('Database connection not properly initialized')
    }

    // Test the connection by making a simple query
    const collections = await mongoose.connection.db.collections()
    console.log(
      'Available collections:',
      collections.map((c) => c.collectionName),
    )

    await mongoose.connection.close()
    console.log('Connection closed successfully')
  } catch (error) {
    console.error('Connection test failed:', error)
    process.exit(1)
  }
}

testConnection()
