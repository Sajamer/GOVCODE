import { PrismaClient } from '@prisma/client'
import { organization } from './utils/OrganizationSeed' // Array of organizations to seed

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding started!')

  // Clear existing data
  console.log('Clearing existing data...')
  await prisma.department.deleteMany() // Clear departments first
  await prisma.organization.deleteMany() // Then clear organizations

  for (const org of organization) {
    await prisma.organization.create({
      data: org,
    })
  }

  console.log('Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
