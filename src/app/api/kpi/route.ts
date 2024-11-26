import { sendError } from '@/lib/utils'
import { validate } from '@/lib/validate'
import { IKpiFormDropdownData } from '@/types/kpi'
import { NextRequest, NextResponse } from 'next/server'

import { STATUS_CODES } from '@/constants/status-codes'
import prisma from '@/lib/db_connection'

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
