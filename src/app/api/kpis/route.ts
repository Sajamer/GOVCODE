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

export async function POST(req: NextRequest) {
  try {
    // Read the file as a Uint8Array (compatible with Buffer)
    const arrayBuffer = await req.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer) as Buffer

    // Parse the Excel file using ExcelJS
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    // Assuming the first sheet contains the data
    const worksheet = workbook.worksheets[0]

    if (!worksheet) {
      return NextResponse.json({
        data: null,
        message: 'No sheet found in the Excel file',
        status: STATUS_CODES.BAD_REQUEST,
      })
    }

    // Extract rows from the worksheet
    const rows: ExcelJS.CellValue[][] = []
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      // Ensure row.values is an array and push it into the rows array
      if (Array.isArray(row.values)) {
        rows.push(row.values)
      } else {
        throw new Error('Row values must be an array.')
      }
    })

    if (rows.length < 2) {
      throw new Error('The Excel sheet does not have valid headers or data.')
    }

    // Extract headers and data rows
    const headers = rows[0].slice(1) // Remove the first element which is null (row.values is 1-indexed)
    const dataRows = rows.slice(1).map((row) => row.slice(1))

    // Validate headers
    if (!Array.isArray(headers) || headers.length === 0) {
      throw new Error('The Excel sheet does not have valid headers.')
    }

    // Convert rows into objects using headers as keys
    const parsedRows = dataRows.map((row) => {
      return headers.reduce(
        (acc: Record<string, ExcelJS.CellValue | null>, header, index) => {
          // Ensure the header is a string
          if (typeof header === 'string') {
            acc[header] = row[index] || null // Map each column to the corresponding header
          }
          return acc
        },
        {},
      )
    })

    // Validate and prepare data for insertion
    const kpiDataArray = await Promise.all(
      parsedRows.map(async (row) => {
        if (!row.Department || typeof row.Department !== 'string') {
          throw new Error('Department is required and must be a string')
        }
        const departmentId = await getDepartmentId(row.Department)

        if (!departmentId) {
          throw new Error(`Invalid department: ${row.Department}`)
        }

        return {
          code: row['Kpi Code'],
          name: row['KPI Name'],
          owner: row.Owner,
          description: row.Description,
          measurementNumber: row['Measurement Number'],
          resources: row.Resources,
          unit: row.Unit,
          frequency: row.Frequency,
          type: row.Type,
          calibration: row.Calibration,
          departmentId,
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
            unit: data.unit as Units,
            frequency: data.frequency as Frequency,
            type: data.type as KPIType,
            calibration: data.calibration as Calibration,
            departmentId: data.departmentId,
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
    return NextResponse.json({
      data: null,
      message: 'Error importing KPIs',
      status: STATUS_CODES.SERVER_ERROR,
    })
  }
}
