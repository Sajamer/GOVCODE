import { Toaster } from '@/components/ui/toaster'
import { Locale, routing } from '@/i18n/routing'
import TanStackProvider from '@/providers/TanstackProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Poppins } from 'next/font/google'
import { notFound } from 'next/navigation'

import '../globals.css'

type LocalLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

export default async function LocalLayout({
  children,
  params,
}: LocalLayoutProps) {
  const { locale } = await params

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      suppressHydrationWarning
    >
      <body className={`${poppins.variable} font-poppins antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <TanStackProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </TanStackProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
