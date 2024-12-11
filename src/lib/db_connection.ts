import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    })
  }
  prisma = global.prisma
}

if (!prisma) {
  prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })
}

async function cleanup() {
  if (prisma) {
    await prisma.$disconnect()
    console.log('Prisma disconnected')
  }
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

export default prisma
