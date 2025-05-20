/* eslint-disable @typescript-eslint/no-explicit-any */
import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'
import { routing } from './i18n/routing'
 
// const publicPages = ['/', '/sign-in', '/sign-up']

const intlMiddleware = createMiddleware(routing)

export default function middleware(req: NextRequest) {
  // const publicPathnameRegex = RegExp(
  //   `^(/(${routing.locales.join('|')}))?(${publicPages
  //     .flatMap((p) => (p === '/' ? ['', '/'] : p))
  //     .join('|')})/?$`,
  //   'i',
  // )
  // const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname)

  return intlMiddleware(req)
}

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
