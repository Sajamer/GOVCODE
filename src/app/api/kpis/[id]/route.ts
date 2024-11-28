import { sendError } from '@/lib/utils'
import { validate } from '@/lib/validate'
import { NextRequest, NextResponse } from 'next/server'

import { STATUS_CODES } from '@/constants/status-codes'
import prisma from '@/lib/db_connection'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  return validate(
    null,
    async () => {
      const param = await params
      const id = Number(param.id)

      try {
        if (!id) {
          return NextResponse.json({
            data: null,
            message: 'Invalid KPI ID',
            status: STATUS_CODES.BAD_REQUEST,
          })
        }

        if (isNaN(id)) {
          return NextResponse.json({
            data: null,
            message: 'Invalid KPI ID format',
            status: STATUS_CODES.BAD_REQUEST,
          })
        }

        // Check if KPI exists
        const kpi = await prisma.kPI.findUnique({ where: { id } })

        if (!kpi) {
          return NextResponse.json({
            data: null,
            message: 'KPI not found',
            status: STATUS_CODES.NOT_FOUND,
          })
        }

        await prisma.kPI.delete({ where: { id } })

        return NextResponse.json({
          data: { id },
          message: 'KPI deleted successfully',
          status: STATUS_CODES.SUCCESS,
        })
      } catch (error) {
        sendError(error)
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'

        const response: IResponse<unknown> = {
          data: errorMessage,
          message: 'Error deleting KPI',
          status: STATUS_CODES.SERVER_ERROR,
        }

        return NextResponse.json(response)
      }
    },
    true,
    ['DELETE'],
  )(req)
}
