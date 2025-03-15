'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useTab } from '@/hooks/useTab'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FC, ReactNode, useState } from 'react'

interface IAccordionSidebarProps {
  data: string[]
  title: string
  path: string
  icon: ReactNode
}

const AccordionSidebar: FC<IAccordionSidebarProps> = ({
  data,
  title,
  path,
  icon,
}) => {
  const pathname = usePathname()
  const tab = useTab()
  const [isOpen, setIsOpen] = useState<boolean>(
    data.some(
      (element) =>
        element.toLocaleLowerCase() ===
        tab?.toLocaleLowerCase().replace(/-/g, ' '),
    ),
  )

  const toggleState = () => {
    setIsOpen((prev) => !prev)
  }

  console.log('acc: ', data, pathname, tab, path)

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={isOpen ? 'item-1' : 'item-2'}
      className={cn(
        'w-full bg-background dark:bg-dark-background',
        pathname === path ? 'text-white' : 'dark:text-white',
      )}
    >
      <AccordionItem value="item-1" className="border-b-0">
        <AccordionTrigger
          onClick={() => toggleState()}
          className={cn(
            'flex flex-col gap-4 text-base py-2 hover:no-underline lg:flex-row lg:items-center lg:justify-start lg:px-5',
            pathname === path
              ? 'bg-primary rounded-xl [&[data-state=open]>svg]:hidden [&[data-state=closed]>svg]:hidden lg:[&[data-state=closed]>svg]:block lg:[&[data-state=open]>svg]:block lg:[&[data-state=open]>svg]:text-white lg:[&[data-state=closed]>svg]:text-white'
              : 'hover:text-primary [&[data-state=open]>svg]:hidden [&[data-state=closed]>svg]:hidden lg:[&[data-state=closed]>svg]:block lg:[&[data-state=open]>svg]:block lg:[&[data-state=open]>svg]:hover:text-primary lg:[&[data-state=closed]>svg]:hover:text-primary',
          )}
        >
          <div className="flex items-center gap-3 [&[data-state=open]>svg]:!rotate-0">
            {icon}
            <span className="hidden lg:block ">{title}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <ul className="hidden w-full flex-col items-start justify-center gap-3 text-xs font-semibold text-gray-400 lg:ml-10 lg:mt-3 lg:flex lg:border-l-2 lg:!border-primary lg:py-2 lg:pl-3">
            {data.map((element) => (
              <li key={element}>
                <Link
                  href={`${path}?tab=${element
                    .toLowerCase()
                    .replace(/ /g, '-')}`}
                  className={cn(
                    'text-xs cursor-pointer hover:text-primary',
                    tab?.toLocaleLowerCase().replace(/-/g, ' ') ===
                      element.toLocaleLowerCase()
                      ? 'text-primary hover:text-primary'
                      : 'text-gray-400 hover:text-primary',
                    pathname !== path && 'hover:text-primary',
                  )}
                >
                  {element}
                </Link>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default AccordionSidebar
