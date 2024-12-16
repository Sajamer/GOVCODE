'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function NotFound(): JSX.Element {
  const router = useRouter()

  return (
    <html lang="en">
      <body>
        <section className="flex h-screen w-full flex-col items-center justify-center">
          <Image
            src={'/assets/icons/404.svg'}
            width={533}
            height={564}
            alt="not-found"
            priority
          />
          <h1 className="text-4xl font-semibold text-gray-600">Oops!!</h1>
          <p className="mt-3 text-gray-500">
            This page you are looking for could not be found.
          </p>
          <Button
            className="mt-6 h-14 w-fit px-6"
            onClick={() => router.push('/')}
          >
            Go Back to Home
          </Button>
        </section>
      </body>
    </html>
  )
}
