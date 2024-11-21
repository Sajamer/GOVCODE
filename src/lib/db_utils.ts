import prisma from '@/lib/db_connection'
import { sendError } from './utils'

export const testDatabaseConnection = async (): Promise<void> => {
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch (error) {
    sendError(error)
    throw new Error('Database connection failed')
  }
}
