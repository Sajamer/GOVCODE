import { NextIntlClientProvider } from 'next-intl'
import '../globals.css'
import { getMessages } from 'next-intl/server'
import Navbar from '@/components/navbar/Navbar'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`${poppins.variable} font-poppins antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <div className="mx-auto h-screen max-w-4xl">
            <Navbar locale={locale} />
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
