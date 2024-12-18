import { STATUS_CODES } from '@/constants/status-codes'
import prisma from '@/lib/db_connection'
import { sendError } from '@/lib/utils'
import { validate } from '@/lib/validate'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest): Promise<NextResponse> {
  return validate(
    {},
    async (validateReq) => {
      try {
        const { session } = validateReq

        console.log('Session:', session)

        const departments = await prisma.department.findMany({
          select: { id: true, name: true },
        })

        const response: IResponse<IDepartment[]> = {
          data: departments,
          message: 'Departments fetched successfully',
          status: STATUS_CODES.SUCCESS,
        }

        return NextResponse.json(response)
      } catch (error) {
        sendError(error)
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'

        const response: IResponse<unknown> = {
          message: 'Error fetching departments',
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
