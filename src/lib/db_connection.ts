import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['warn', 'error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    transactionOptions: {
      maxWait: 5000, // default: 2000
      timeout: 60000, // default: 5000
      isolationLevel: 'ReadCommitted', // optional, default defined by database
    },
  })
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['warn', 'error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      transactionOptions: {
        maxWait: 5000, // default: 2000
        timeout: 60000, // default: 5000
        isolationLevel: 'ReadCommitted', // optional, default defined by database
      },
    })
  }
  prisma = global.prisma
}

export default prisma
