import { sendError } from '@/lib/utils'
import { validate } from '@/lib/validate'
import { NextRequest, NextResponse } from 'next/server'

import { STATUS_CODES } from '@/constants/status-codes'
import prisma from '@/lib/db_connection'
import { ParamsSchema } from '@/schema/kpi.schema'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: number } },
): Promise<NextResponse> {
  return validate(
    null,
    async () => {
      try {
        const { id } = params
        const parsed = ParamsSchema.safeParse({ id })

        if (!parsed.success) {
          return NextResponse.json(
            { message: 'Invalid kpi ID' },
            { status: 400 },
          )
        }

        await prisma.kPI.delete({
          where: { id: Number(id) },
        })

        const response: IResponse<unknown> = {
          data: null,
          message: 'KPI deleted successfully',
          status: STATUS_CODES.SUCCESS,
        }

        return NextResponse.json(response)
      } catch (error) {
        sendError(error)
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'

        const response: IResponse<unknown> = {
          message: 'Error deleting KPI',
          data: errorMessage,
          status: STATUS_CODES.SERVER_ERROR,
        }

        return NextResponse.json(response)
      }
    },
    true,
    ['DELETE'],
  )(req)
}
