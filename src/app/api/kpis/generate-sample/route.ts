import { STATUS_CODES } from '@/constants/status-codes'
import prisma from '@/lib/db_connection'
import { sendError } from '@/lib/utils'
import { validate } from '@/lib/validate'
import ExcelJS from 'exceljs'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest): Promise<NextResponse> {
  return validate(
    null,
    async () => {
      try {
        const organizationId = Number(req.nextUrl.searchParams.get('id'))

        if (!organizationId) {
          return NextResponse.json({
            data: null,
            message: 'Invalid Organization ID',
            status: STATUS_CODES.BAD_REQUEST,
          })
        }

        if (isNaN(organizationId)) {
          return NextResponse.json({
            data: null,
            message: 'Invalid Organization ID format',
            status: STATUS_CODES.BAD_REQUEST,
          })
        }

        // Fetch all required data
        const [departments] = await Promise.all([
          prisma.department.findMany({
            where: { organizationId },
            select: { id: true, name: true },
          }),
          // prisma.process.findMany({
          //   select: { id: true, name: true },
          // }),
          // prisma.compliance.findMany({
          //   select: { id: true, name: true },
          // }),
          // prisma.objective.findMany({
          //   select: { id: true, name: true },
          // }),
        ])

        // Create a new workbook
        const workbook = new ExcelJS.Workbook()

        // Add a worksheet for the main data
        const sheet = workbook.addWorksheet('KPIs Template')

        // Add a worksheet for dropdown values
        const dropdownSheet = workbook.addWorksheet('Dropdown Values')

        // Add column headers to the main sheet
        const headers = [
          'Kpi Code',
          'KPI Name',
          'Owner',
          'Description',
          'Department',
          'Measurement Number',
          'Resources',
          'Unit',
          'Frequency',
          'Calibration',
          'Type',
        ]
        sheet.addRow(headers)

        const units = ['PERCENTAGE', 'NUMBER', 'TIME', 'DAYS']
        const frequencies = [
          'MONTHLY',
          'QUARTERLY',
          'SEMI_ANNUALLY',
          'ANNUALLY',
        ]
        const calibration = ['INCREASING', 'DECREASING']
        const types = ['CUMULATIVE', 'STAGING']

        // Add dropdown values to the dropdown sheet
        const departmentNames = departments.map((d) => d.name)

        dropdownSheet.getColumn(1).values = ['Departments', ...departmentNames]
        dropdownSheet.getColumn(5).values = ['Units', ...units]
        dropdownSheet.getColumn(6).values = ['Frequencies', ...frequencies]
        dropdownSheet.getColumn(7).values = ['Calibration', ...calibration]
        dropdownSheet.getColumn(8).values = ['Types', ...types]

        // Hide the dropdown sheet
        dropdownSheet.state = 'hidden'

        // Set headers and adjust column widths dynamically
        sheet.columns = headers.map((header) => {
          return {
            header, // Assign the header directly to the column
            key: header.replace(/\s+/g, '_').toLowerCase(), // Generate a unique key
            width: Math.max(
              header.length, // Calculate width based on header length
              15, // Set a minimum width to ensure visibility
            ),
          }
        })

        // Add dropdown validations to the main sheet
        const addValidation = (cellRange: string, formulaRange: string) => {
          sheet.getCell(cellRange).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [formulaRange],
          }
        }

        // Reference ranges in the hidden sheet
        addValidation(
          'E2:E100',
          `'Dropdown Values'!$A$2:$A${departmentNames.length + 1}`,
        ) // Departments
        addValidation('H2:H100', `'Dropdown Values'!$E$2:$E${units.length + 1}`) // Units
        addValidation(
          'I2:I100',
          `'Dropdown Values'!$F$2:$F${frequencies.length + 1}`,
        ) // Frequencies
        addValidation(
          'J2:J100',
          `'Dropdown Values'!$G$2:$G${calibration.length + 1}`,
        ) // Calibration
        addValidation('K2:K100', `'Dropdown Values'!$H$2:$H${types.length + 1}`) // Types

        // Generate the Excel file
        const buffer = await workbook.xlsx.writeBuffer()

        return new NextResponse(buffer, {
          status: STATUS_CODES.SUCCESS,
          headers: {
            'Content-Type':
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="kpis-template.xlsx"',
          },
        })
      } catch (error) {
        sendError(error)
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'

        return NextResponse.json({
          data: errorMessage,
          message: 'Error sending sample file',
          status: STATUS_CODES.SERVER_ERROR,
        })
      }
    },
    true,
    ['GET'],
  )(req)
}
