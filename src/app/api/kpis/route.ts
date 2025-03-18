import { sendError } from '@/lib/utils'
import { validate } from '@/lib/validate'
import { IKpiFormDropdownData } from '@/types/kpi'
import ExcelJS from 'exceljs'
import { NextRequest, NextResponse } from 'next/server'

import { STATUS_CODES } from '@/constants/status-codes'
import prisma from '@/lib/db_connection'
import { Calibration, Frequency, KPIType, Units } from '@prisma/client'

async function fetchObjectives() {
  return prisma.objective.findMany({ select: { id: true, name: true } })
}

async function fetchCompliances() {
  return prisma.compliance.findMany({ select: { id: true, name: true } })
}

async function fetchProcesses() {
  return prisma.process.findMany({ select: { id: true, name: true } })
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  return validate(
    {},
    async () => {
      try {
        const [objectives, compliances, processes] = await Promise.all([
          fetchObjectives(),
          fetchCompliances(),
          fetchProcesses(),
        ])

        const response: IResponse<IKpiFormDropdownData> = {
          data: { objectives, compliances, processes },
          message:
            'Objectives, compliances, and processes fetched successfully',
          status: STATUS_CODES.SUCCESS,
        }

        return NextResponse.json(response)
      } catch (error) {
        sendError(error)
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'

        const response: IResponse<unknown> = {
          message: 'Error fetching objectives, compliances, and processes',
          data: errorMessage,
          status: STATUS_CODES.SERVER_ERROR,
        }

        return NextResponse.json(response)
      }
    },
    true,
    ['GET'],
  )(req)
}

// Helper functions to get IDs for related entities
async function getDepartmentId(name: string) {
  try {
    const department = await prisma.department.findUnique({
      where: { name },
    })

    return department ? department.id : null
  } catch (error) {
    console.error(`Error fetching department with name "${name}":`, error)
    throw new Error(`Department "${name}" not found`)
  }
}

async function getStatusId(name: string) {
  try {
    const status = await prisma.status.findFirstOrThrow({
      where: { name },
    })

    return status ? status.id : null
  } catch (error) {
    console.error(`Error fetching status with name "${name}":`, error)
    throw new Error(`Status "${name}" not found`)
  }
}

export async function POST(req: NextRequest) {
  try {
    const arrayBuffer = await req.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer) as Buffer
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    const worksheet = workbook.worksheets[0]
    if (!worksheet) {
      return NextResponse.json(
        {
          data: null,
          message: 'No sheet found in the Excel file',
          status: STATUS_CODES.BAD_REQUEST,
        },
        { status: STATUS_CODES.BAD_REQUEST },
      )
    }

    // Extract rows with better error handling
    const rows: ExcelJS.CellValue[][] = []
    try {
      worksheet.eachRow({ includeEmpty: true }, (row) => {
        if (Array.isArray(row.values)) {
          rows.push(row.values)
        } else {
          throw new Error('Invalid row format detected')
        }
      })
    } catch (error) {
      return NextResponse.json(
        {
          data: null,
          message: 'Error reading Excel rows: ' + (error as Error).message,
          status: STATUS_CODES.BAD_REQUEST,
        },
        { status: STATUS_CODES.BAD_REQUEST },
      )
    }

    if (rows.length < 2) {
      return NextResponse.json(
        {
          data: null,
          message:
            'The Excel sheet must contain headers and at least one data row',
          status: STATUS_CODES.BAD_REQUEST,
        },
        { status: STATUS_CODES.BAD_REQUEST },
      )
    }

    const headers = rows[0].slice(1)
    const dataRows = rows.slice(1).map((row) => row.slice(1))

    // Validate headers
    const requiredHeaders = [
      'Kpi Code',
      'KPI Name',
      'Department',
      'Status Type',
      // Add other required headers
    ]
    const missingHeaders = requiredHeaders.filter(
      (header) => !headers.includes(header),
    )
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        {
          data: null,
          message: `Missing required headers: ${missingHeaders.join(', ')}`,
          status: STATUS_CODES.BAD_REQUEST,
        },
        { status: STATUS_CODES.BAD_REQUEST },
      )
    }

    const parsedRows = dataRows.map((row) => {
      return headers.reduce(
        (acc: Record<string, ExcelJS.CellValue | null>, header, index) => {
          if (typeof header === 'string') {
            acc[header] = row[index] || null
          }
          return acc
        },
        {},
      )
    })

    // Filter out rows that are completely empty (i.e. without KPI Code and KPI Name)
    const nonEmptyParsedRows = parsedRows.filter(
      (row) => row['Kpi Code'] !== null || row['KPI Name'] !== null,
    )

    // Check for duplicates in the Excel file
    const kpiCodes = new Set()
    const kpiNames = new Set()
    const duplicateErrors: string[] = []

    nonEmptyParsedRows.forEach((row, index) => {
      const rowNumber = index + 2
      const code = row['Kpi Code']?.toString()
      const name = row['KPI Name']?.toString()

      if (kpiCodes.has(code)) {
        duplicateErrors.push(`Row ${rowNumber}: Duplicate KPI Code "${code}"`)
      }
      if (kpiNames.has(name)) {
        duplicateErrors.push(`Row ${rowNumber}: Duplicate KPI Name "${name}"`)
      }

      kpiCodes.add(code)
      kpiNames.add(name)
    })

    // Check for existing KPIs in database
    const existingKPIs = await prisma.kPI.findMany({
      where: {
        OR: [
          { code: { in: Array.from(kpiCodes).map(String) } },
          { name: { in: Array.from(kpiNames).map(String) } },
        ],
      },
      select: { code: true, name: true },
    })

    if (existingKPIs.length > 0) {
      const existingErrors = existingKPIs.map(
        (kpi) =>
          `KPI with code "${kpi.code}" or name "${kpi.name}" already exists in database`,
      )
      duplicateErrors.push(...existingErrors)
    }

    if (duplicateErrors.length > 0) {
      return NextResponse.json(
        {
          data: null,
          message: 'Validation failed:\n' + duplicateErrors.join('\n'),
          status: STATUS_CODES.BAD_REQUEST,
        },
        { status: STATUS_CODES.BAD_REQUEST },
      )
    }

    // Validate and prepare data for insertion with enhanced error handling
    const kpiDataArray = await Promise.all(
      nonEmptyParsedRows.map(async (row, index) => {
        const rowNumber = index + 2 // Adding 2 to account for header row and 0-based index

        // Validate required fields
        if (!row['Kpi Code']) {
          throw new Error(`Row ${rowNumber}: KPI Code is required`)
        }
        if (!row['KPI Name']) {
          throw new Error(`Row ${rowNumber}: KPI Name is required`)
        }
        if (!row.Department || typeof row.Department !== 'string') {
          throw new Error(
            `Row ${rowNumber}: Department is required and must be a string`,
          )
        }

        // Validate Status Type and Status
        const statusType = row['Status Type']?.toString()
        if (!statusType || !['default', 'custom'].includes(statusType)) {
          throw new Error(
            `Row ${rowNumber}: Status Type must be either 'default' or 'custom'`,
          )
        }

        let statusId = null
        if (statusType === 'custom') {
          if (!row.Status) {
            throw new Error(
              `Row ${rowNumber}: Status is required when Status Type is 'custom'`,
            )
          }
          statusId = await getStatusId(row.Status.toString())
          if (!statusId) {
            throw new Error(`Row ${rowNumber}: Invalid Status value`)
          }
        }

        const departmentId = await getDepartmentId(row.Department)
        if (!departmentId) {
          throw new Error(
            `Row ${rowNumber}: Invalid department: ${row.Department}`,
          )
        }

        // Validate enums
        if (row.Unit && !Object.values(Units).includes(row.Unit as Units)) {
          throw new Error(`Row ${rowNumber}: Invalid Unit value`)
        }
        if (
          row.Frequency &&
          !Object.values(Frequency).includes(row.Frequency as Frequency)
        ) {
          throw new Error(`Row ${rowNumber}: Invalid Frequency value`)
        }
        if (row.Type && !Object.values(KPIType).includes(row.Type as KPIType)) {
          throw new Error(`Row ${rowNumber}: Invalid Type value`)
        }
        if (
          row.Calibration &&
          !Object.values(Calibration).includes(row.Calibration as Calibration)
        ) {
          throw new Error(`Row ${rowNumber}: Invalid Calibration value`)
        }

        return {
          code: row['Kpi Code'],
          name: row['KPI Name'],
          owner: row.Owner,
          description: row.Description,
          measurementNumber: row['Measurement Number'],
          resources: row.Resources,
          unit: row.Unit as Units,
          frequency: row.Frequency as Frequency,
          type: row.Type as KPIType,
          calibration: row.Calibration as Calibration,
          departmentId,
          statusId,
          statusType,
        }
      }),
    )

    // Insert data into the database
    const insertedKPIs = await Promise.all(
      kpiDataArray.map(async (data) => {
        return await prisma.kPI.create({
          data: {
            name: data.name?.toString() ?? '',
            code: data.code?.toString() ?? '',
            description: data.description?.toString() ?? '',
            owner: data.owner?.toString() ?? '',
            measurementNumber: data.measurementNumber?.toString() ?? '',
            resources: data.resources?.toString() ?? '',
            unit: data.unit,
            frequency: data.frequency,
            type: data.type,
            calibration: data.calibration,
            departmentId: data.departmentId,
            statusId: data.statusId,
            statusType: data.statusType,
          },
        })
      }),
    )

    return NextResponse.json({
      data: insertedKPIs,
      message: 'KPIs imported successfully',
      status: STATUS_CODES.SUCCESS,
    })
  } catch (error) {
    console.error('Error importing KPIs:', error)
    return NextResponse.json(
      {
        data: null,
        message: (error as Error).message || 'Error importing KPIs',
        status: STATUS_CODES.BAD_REQUEST,
      },
      { status: STATUS_CODES.BAD_REQUEST },
    )
  }
}
