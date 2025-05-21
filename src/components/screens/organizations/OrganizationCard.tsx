'use client'

import { Link } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { FC } from 'react'

interface IOrganizationCardProps {
  data: IOrganization
}

const OrganizationCard: FC<IOrganizationCardProps> = ({ data }) => {
  const isArabic = usePathname().includes('/ar')
  const t = useTranslations('general')

  return (
    <div className="flex w-full items-center justify-between gap-3 rounded-3xl bg-neutral-200 px-3 py-6 md:gap-[3.12rem] md:px-[1.88rem]">
      <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-center lg:gap-[3.12rem]">
        <div className="flex items-center gap-4 md:gap-[1.875rem] lg:min-w-80 xl:min-w-[26.375rem]">
          <Image
            src={
              data.logo && data.logo.length > 0
                ? data.logo
                : '/assets/images/organization.png'
            }
            alt="organization logo"
            width={80}
            height={80}
            className="size-14 rounded-full md:size-20"
          />

          <div className="flex max-w-[19.5rem] flex-col gap-[0.19rem] truncate">
            <div className="max-w-40 truncate text-lg font-medium text-neutral-800 md:text-2xl">
              {data.name}
            </div>
          </div>
        </div>
        <div className="flex w-full gap-11">
          <div className="flex flex-col items-start gap-3 md:flex-row">
            <h2 className="text-[0.875rem] font-normal leading-normal text-neutral-600 ">
              {t('address')}:
            </h2>
            <span className="text-[0.875rem] font-medium leading-normal text-neutral-800">
              {data.country + ', ' + data.state + ', ' + data.city}
            </span>
          </div>
          <div className="flex flex-col items-start gap-3 md:flex-row">
            <h2 className="text-[0.875rem] font-normal leading-normal text-neutral-600 ">
              {t('email')}:
            </h2>
            <span className="text-[0.875rem] font-medium leading-normal text-neutral-800">
              {data.email}
            </span>
          </div>
        </div>
      </div>
      <div>
        <Link href={`/organization/${data.id}`}>
          <ArrowRight
            size={24}
            className={cn('text-neutral-800', isArabic && 'rotate-180')}
          />
        </Link>
      </div>
    </div>
  )
}

export default OrganizationCard
