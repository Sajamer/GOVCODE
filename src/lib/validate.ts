/* eslint-disable @typescript-eslint/no-explicit-any */
import { Method } from '@/types/method'
import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema } from 'zod'
import { auth } from './auth'
import { testDatabaseConnection } from './db_utils'
import { sendError } from './utils'

export function validate(
  schema: {
    body?: ZodSchema<any>
    params?: ZodSchema<any>
  } | null = null,
  handler: (req: IValidatedRequest, res: NextResponse) => Promise<NextResponse>,
  isSecure: boolean,
  method: Method[],
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      await testDatabaseConnection()

      if (!method.includes(req.method as Method)) {
        return NextResponse.json(
          { message: 'Method not allowed' },
          { status: 405 },
        )
      }

      const session = await auth()

      if (isSecure && !session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }

      let validatedBody
      let validatedQuery
      if (schema) {
        if (schema.body) {
          const body = await req.json()
          validatedBody = schema.body.parse(body)
        }
        if (schema.params) {
          validatedQuery = schema.params.parse(
            Object.fromEntries(req.nextUrl.searchParams),
          )
        }
      }

      const validatedReq: IValidatedRequest = {
        body: validatedBody,
        query: validatedQuery,
        session,
      }

      return handler(validatedReq, new NextResponse())
    } catch (error) {
      sendError(error)
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      return NextResponse.json({ error: errorMessage }, { status: 409 })
    }
  }
}
