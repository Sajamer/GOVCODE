import { ChartColumnIncreasing, ChartSpline } from 'lucide-react'
import { useTranslations } from 'next-intl'

export const SidebarItems = () => {
  const t = useTranslations('general')

  return [
    {
      title: t('kpi'),
      icon: <ChartSpline className="size-5 min-w-5" />,
      href: '/',
    },
    {
      title: t('kpi-analysis'),
      icon: <ChartColumnIncreasing className="size-5 min-w-5" />,
      href: '/kpi-analysis',
    },
  ]
}
