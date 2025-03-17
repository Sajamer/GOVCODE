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
        const [departments, status] = await Promise.all([
          prisma.department.findMany({
            where: { organizationId },
            select: { id: true, name: true },
          }),

          prisma.status.findMany({
            select: { id: true, name: true },
          }),
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
          'Status Type',
          'Status',
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
        const statusType = ['default', 'custom']

        // Add dropdown values to the dropdown sheet
        const departmentNames = departments.map((d) => d.name)
        const statusNames = status.map((s) => s.name)

        dropdownSheet.getColumn(1).values = ['Departments', ...departmentNames]
        dropdownSheet.getColumn(5).values = ['Units', ...units]
        dropdownSheet.getColumn(6).values = ['Frequencies', ...frequencies]
        dropdownSheet.getColumn(7).values = ['Calibration', ...calibration]
        dropdownSheet.getColumn(8).values = ['Types', ...types]
        dropdownSheet.getColumn(9).values = ['Status Type', ...statusType]
        dropdownSheet.getColumn(10).values = ['Status', ...statusNames]

        // Hide the dropdown sheet
        dropdownSheet.state = 'hidden'

        // Set headers and adjust column widths dynamically
        sheet.columns = headers.map((header, index) => {
          const column = {
            header,
            key: header.replace(/\s+/g, '_').toLowerCase(),
            width: Math.max(header.length, 15),
          }

          // Unlock all cells in the column (except header)
          for (let row = 2; row <= 100; row++) {
            const cell = sheet.getCell(row, index + 1)
            cell.protection = { locked: false }
          }

          return column
        })

        // Define validation function
        const addValidation = (col: string, formulaRange: string) => {
          for (let row = 2; row <= 100; row++) {
            sheet.getCell(`${col}${row}`).dataValidation = {
              type: 'list',
              allowBlank: true,
              formulae: [formulaRange],
            }
          }
        }

        // Add dropdown validations for all fields that need them
        addValidation(
          'E',
          `'Dropdown Values'!$A$2:$A${departmentNames.length + 1}`,
        ) // Departments
        addValidation('H', `'Dropdown Values'!$E$2:$E${units.length + 1}`) // Units
        addValidation('I', `'Dropdown Values'!$F$2:$F${frequencies.length + 1}`) // Frequencies
        addValidation('J', `'Dropdown Values'!$G$2:$G${calibration.length + 1}`) // Calibration
        addValidation('K', `'Dropdown Values'!$H$2:$H${types.length + 1}`) // Types

        // Handle Status Type and Status columns
        for (let row = 2; row <= 100; row++) {
          const statusTypeCell = sheet.getCell(`L${row}`)
          const statusCell = sheet.getCell(`M${row}`)

          // Remove the default value setting
          statusTypeCell.protection = { locked: false }
          statusTypeCell.dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`'Dropdown Values'!$I$2:$I${statusType.length + 1}`],
          }

          // Add validation and protection for Status based on Status Type
          statusCell.protection = { locked: false }
          statusCell.dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [
              `IF(L${row}="custom",'Dropdown Values'!$J$2:$J${statusNames.length + 1},"")`,
            ],
            showErrorMessage: true,
            errorStyle: 'stop',
            errorTitle: 'Invalid Input',
            error: 'Status can only be selected when Status Type is "custom"',
          }
        }

        // Enable worksheet protection LAST, after all validations and cell configurations
        sheet.protect('', {
          selectLockedCells: false,
          selectUnlockedCells: true,
          formatCells: true,
          formatColumns: true,
          formatRows: true,
          insertColumns: false,
          insertRows: false,
          insertHyperlinks: false,
          deleteColumns: false,
          deleteRows: false,
          sort: false,
          autoFilter: false,
          pivotTables: false,
        })

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
