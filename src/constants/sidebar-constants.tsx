import {
  Building2,
  ChartColumnIncreasing,
  ChartSpline,
  Clock5,
  LayoutDashboard,
} from 'lucide-react'
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
    {
      title: t('kpi-status'),
      icon: <Clock5 className="size-5 min-w-5" />,
      href: '/kpi-status',
    },
    {
      title: t('organizations'),
      icon: <Building2 className="size-5 min-w-5" />,
      href: '/organization',
      permissions: ['superAdmin', 'moderator'],
    },
    {
      title: t('dashboard'),
      icon: <LayoutDashboard className="size-5 min-w-5" />,
      href: '/dashboard',
    },
  ]
}
