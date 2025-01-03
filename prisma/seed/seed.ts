import { createHashedPassword } from '@/lib/utils'
import { PrismaClient } from '@prisma/client'
import { compliances, objectives, Processes } from './utils/GlobalSeed'
import { organization } from './utils/OrganizationSeed' // Array of organizations to seed

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding started!')

  // Clear existing data
  console.log('Clearing existing data...')
  await prisma.kPIProcess.deleteMany() // Clear KPIProcess
  await prisma.kPICompliance.deleteMany() // Clear KPICompliance
  await prisma.kPIObjective.deleteMany() // Clear KPIObjective
  await prisma.kPI.deleteMany() // Clear KPIs
  await prisma.user.deleteMany() // Clear users
  await prisma.department.deleteMany() // Clear departments first
  await prisma.organization.deleteMany() // Then clear organizations
  await prisma.objective.deleteMany() // Clear objectives
  await prisma.process.deleteMany() // Clear processes
  await prisma.compliance.deleteMany() // Clear compliances

  // Seed organizations
  console.log('Seeding organizations...')
  for (const org of organization) {
    await prisma.organization.create({
      data: org,
    })
  }

  // Seed objectives
  console.log('Seeding objectives...')
  for (const objective of objectives) {
    await prisma.objective.create({
      data: objective,
    })
  }

  // Seed processes
  console.log('Seeding processes...')
  for (const process of Processes) {
    await prisma.process.create({
      data: process,
    })
  }

  // Seed compliances
  console.log('Seeding compliances...')
  for (const compliance of compliances) {
    await prisma.compliance.create({
      data: compliance,
    })
  }

  console.log('Seeding users!')
  const email = 'moustafa.a.tlais@gmail.com'
  const password = 'pass123123'
  const { salt, hash } = await createHashedPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      fullName: 'Moustafa Tlais',
      role: 'superAdmin',
      departmentId: 1,
      accounts: {
        create: {
          provider: 'credentials',
          providerAccountId: email,
          type: 'email',
        },
      },
    },
  })

  await prisma.password.create({
    data: {
      userId: user.id,
      salt,
      hash,
    },
  })

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
