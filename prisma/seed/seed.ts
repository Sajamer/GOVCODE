import { PrismaClient } from '@prisma/client'
import { pbkdf2Sync, randomBytes } from 'crypto'
import { organization } from './utils/OrganizationSeed' // Array of organizations to seed

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding started!')

  // Clear existing data
  console.log('Clearing existing data...')
  await prisma.kPIProcess.deleteMany() // Clear KPIProcess
  await prisma.kPICompliance.deleteMany() // Clear KPICompliance
  await prisma.kPIObjective.deleteMany() // Clear KPIObjective
  await prisma.taskManagement.deleteMany() // Clear tasks
  await prisma.taskStatus.deleteMany() // Clear Task Status
  await prisma.kPI.deleteMany() // Clear KPIs
  await prisma.user.deleteMany() // Clear users
  await prisma.department.deleteMany() // Clear departments first
  await prisma.organization.deleteMany() // Then clear organizations
  await prisma.objective.deleteMany() // Clear objectives
  await prisma.process.deleteMany() // Clear processes
  await prisma.compliance.deleteMany() // Clear compliances

  // Seed organizations
  console.log('Seeding organizations...')
  const org = await prisma.organization.create({
    data: organization,
    include: { departments: true }, // Include created departments
  })

  // Get the first department ID
  const firstDepartmentId = org.departments[0]?.id

  if (!firstDepartmentId) {
    console.error('No department found, aborting user creation.')
    return
  }

  // // Seed objectives
  // console.log('Seeding objectives...')
  // for (const objective of objectives) {
  //   await prisma.objective.create({
  //     data: objective,
  //   })
  // }

  // // Seed processes
  // console.log('Seeding processes...')
  // for (const process of Processes) {
  //   await prisma.process.create({
  //     data: process,
  //   })
  // }

  // // Seed compliances
  // console.log('Seeding compliances...')
  // for (const compliance of compliances) {
  //   await prisma.compliance.create({
  //     data: compliance,
  //   })
  // }

  console.log('Seeding users!')
  const email = 'moustafa.a.tlais@gmail.com'
  const password = 'pass123123'
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')

  const user = await prisma.user.create({
    data: {
      email,
      fullName: 'Moustafa Tlais',
      role: 'superAdmin',
      phone: '+96179312563',
      departmentId: firstDepartmentId,
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
