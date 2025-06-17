import { STATUS_CODES } from '@/constants/status-codes'
import prisma from '@/lib/db_connection'
import ExcelJS from 'exceljs'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const name = formData.get('name') as string
    const statusId = formData.get('statusId') as string
    const file = formData.get('file') as File | null

    if (!name) {
      return NextResponse.json(
        {
          data: {},
          message: 'Framework name is required',
          status: STATUS_CODES.BAD_REQUEST,
        },
        { status: STATUS_CODES.BAD_REQUEST },
      )
    }

    if (!statusId) {
      return NextResponse.json(
        {
          data: {},
          message: 'Status ID is required',
          status: STATUS_CODES.BAD_REQUEST,
        },
        { status: STATUS_CODES.BAD_REQUEST },
      )
    }

    if (!file) {
      return NextResponse.json(
        {
          data: {},
          message: 'File is required',
          status: STATUS_CODES.BAD_REQUEST,
        },
        { status: STATUS_CODES.BAD_REQUEST },
      )
    }

    try {
      const buffer = await file.arrayBuffer()
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(buffer)

      if (!workbook.worksheets || workbook.worksheets.length === 0) {
        return NextResponse.json(
          {
            data: {},
            message: 'No worksheets found in Excel file',
            status: STATUS_CODES.BAD_REQUEST,
          },
          { status: STATUS_CODES.BAD_REQUEST },
        )
      }

      const worksheet = workbook.worksheets[0]
      const headers: string[] = []

      // Get headers from the first row
      worksheet.getRow(1).eachCell((cell: ExcelJS.Cell) => {
        const headerValue = cell.value?.toString().trim()
        if (headerValue) {
          headers.push(headerValue.substring(0, 255)) // Limit header length
        }
      })

      if (headers.length === 0) {
        return NextResponse.json(
          {
            data: {},
            message: 'No headers found in Excel file',
            status: STATUS_CODES.BAD_REQUEST,
          },
          { status: STATUS_CODES.BAD_REQUEST },
        )
      } // Modified to include row and column indices for parent-child relationships
      const attributes: Array<{
        name: string
        value: string
        rowIndex: number
        colIndex: number
      }> = []
      const maxRows = Math.min(worksheet.rowCount, 1000) // Limit number of rows to process

      // Process each row (skip header row)
      for (let rowNumber = 2; rowNumber <= maxRows; rowNumber++) {
        const row = worksheet.getRow(rowNumber)
        let rowHasData = false

        for (let colIndex = 0; colIndex < headers.length; colIndex++) {
          const cell = row.getCell(colIndex + 1)
          let cellValue = ''

          if (cell.value !== null && cell.value !== undefined) {
            if (typeof cell.value === 'object') {
              // Handle rich text or other complex values
              if ('richText' in cell.value) {
                cellValue = cell.value.richText
                  .map((rt: { text: string }) => rt.text)
                  .join('')
              } else if ('text' in cell.value) {
                cellValue = cell.value.text
              } else if ('result' in cell.value) {
                cellValue = cell.value.result?.toString() || ''
              } else {
                cellValue = JSON.stringify(cell.value)
              }
            } else {
              cellValue = cell.value.toString()
            }

            cellValue = cellValue.trim()

            if (cellValue) {
              try {
                attributes.push({
                  name: headers[colIndex],
                  value: cellValue.substring(0, 1000), // Limit value length
                  rowIndex: rowNumber - 2, // Zero-based row index
                  colIndex,
                })
                rowHasData = true
              } catch (err) {
                console.warn(
                  `Skipping invalid cell at row ${rowNumber}, column ${colIndex + 1}:`,
                  err,
                )
              }
            }
          }
        }

        if (!rowHasData) {
          continue // Skip empty rows
        }
      }

      if (attributes.length === 0) {
        return NextResponse.json(
          {
            data: {},
            message: 'No valid data found in Excel file',
            status: STATUS_CODES.BAD_REQUEST,
          },
          { status: STATUS_CODES.BAD_REQUEST },
        )
      }

      // Create framework with its attributes - improved for production
      // Step 1: Create framework first
      const framework = await prisma.framework.create({
        data: {
          name,
          statusId: parseInt(statusId),
        },
      })

      try {
        // Step 2: Create all attributes without parent relationships first
        const attributeData = attributes.map((attr) => ({
          name: attr.name,
          value: attr.value,
          frameworkId: framework.id,
          rowIndex: attr.rowIndex,
          colIndex: attr.colIndex,
          parentId: null,
        }))

        await prisma.frameworkAttribute.createMany({
          data: attributeData,
        })

        // Step 3: Get all created attributes
        const createdAttributes = await prisma.frameworkAttribute.findMany({
          where: { frameworkId: framework.id },
          orderBy: [{ rowIndex: 'asc' }, { colIndex: 'asc' }],
        })

        // Step 4: Update parent relationships in smaller batches
        const attributesByRow: Record<number, typeof createdAttributes> = {}
        createdAttributes.forEach((attr) => {
          if (!attributesByRow[attr.rowIndex]) {
            attributesByRow[attr.rowIndex] = []
          }
          attributesByRow[attr.rowIndex].push(attr)
        })

        // Update parent relationships row by row
        for (const rowIndex in attributesByRow) {
          const rowAttributes = attributesByRow[parseInt(rowIndex)].sort(
            (a, b) => a.colIndex - b.colIndex,
          )

          for (let i = 1; i < rowAttributes.length; i++) {
            await prisma.frameworkAttribute.update({
              where: { id: rowAttributes[i].id },
              data: { parentId: rowAttributes[i - 1].id },
            })
          }
        }

        // Step 5: Return the complete framework
        const result = await prisma.framework.findUnique({
          where: { id: framework.id },
          include: {
            attributes: {
              include: {
                children: true,
              },
              orderBy: [{ rowIndex: 'asc' }, { colIndex: 'asc' }],
            },
          },
        })

        return NextResponse.json({
          data: result,
          message: 'Framework created successfully with attributes',
          status: STATUS_CODES.CREATED,
        })
      } catch (attributeError) {
        // If attribute creation fails, clean up the framework
        try {
          await prisma.framework.delete({
            where: { id: framework.id },
          })
        } catch (cleanupError) {
          console.error('Failed to cleanup framework:', cleanupError)
        }
        throw attributeError
      }
    } catch (error) {
      console.error('Error processing file:', error)
      let errorMessage = 'Error processing file'

      if (error instanceof Error) {
        if (error.message.includes('too long for the column')) {
          errorMessage =
            'Some values in the Excel file are too long. Please check the data and try again.'
        } else {
          errorMessage = error.message
        }
      }

      return NextResponse.json(
        {
          data: {},
          message: errorMessage,
          status: STATUS_CODES.BAD_REQUEST,
        },
        { status: STATUS_CODES.BAD_REQUEST },
      )
    }
  } catch (error) {
    console.error('Error creating framework:', error)
    return NextResponse.json(
      {
        data: {},
        message:
          error instanceof Error ? error.message : 'Error creating framework',
        status: STATUS_CODES.BAD_REQUEST,
      },
      { status: STATUS_CODES.BAD_REQUEST },
    )
  }
}

export async function GET() {
  try {
    const frameworks = await prisma.framework.findMany({
      include: {
        attributes: {
          include: {
            children: true, // Include children attributes
          },
          orderBy: [{ rowIndex: 'asc' }, { colIndex: 'asc' }],
        },
      },
    })

    return NextResponse.json({
      data: frameworks,
      message: 'Frameworks retrieved successfully',
      status: STATUS_CODES.SUCCESS,
    })
  } catch (error) {
    console.error('Error fetching frameworks:', error)
    return NextResponse.json(
      {
        data: {},
        message:
          error instanceof Error ? error.message : 'Failed to fetch frameworks',
        status: STATUS_CODES.BAD_REQUEST,
      },
      { status: STATUS_CODES.BAD_REQUEST },
    )
  }
}
