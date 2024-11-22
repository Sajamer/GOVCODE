import { auth } from '@/lib/auth'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

const AuthLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth()

  if (session) redirect('/')
  return (
    <div className="flex min-h-screen">
      <section className="hidden w-1/2 items-center justify-center bg-brand p-10 lg:flex xl:w-2/5">
        <div className="flex max-h-[800px] max-w-[430px] flex-col justify-center space-y-12">
          {/* <Image
            src="/assets/icons/logo-full.svg"
            alt="logo"
            width={224}
            height={82}
            className="h-auto"
          /> */}
          <p className="body-1 text-white">this is a note: logo goes here</p>
          <div className="space-y-5 text-white">
            <h1 className="h1">Expert Solutions for Your Business Needs</h1>
            <p className="body-1">
              Your trusted partner in achieving success and driving growth.
            </p>
          </div>
          <Image
            src="/assets/images/files.png"
            alt="Files"
            width={342}
            height={342}
            priority
            className="transition-all hover:rotate-2 hover:scale-105"
          />
        </div>
      </section>

      <section className="flex flex-1 flex-col items-center bg-white p-4 py-10 lg:justify-center lg:p-10 lg:py-0">
        <div className="mb-16 lg:hidden">
          <Image
            src="/assets/icons/logo-full-brand.svg"
            alt="logo"
            width={224}
            height={82}
            className="h-auto w-[200px] lg:w-[250px]"
          />
        </div>

        {children}
      </section>
    </div>
  )
}

export default AuthLayout
