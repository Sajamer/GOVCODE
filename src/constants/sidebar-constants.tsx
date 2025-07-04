import {
  BadgeCheck,
  Building2,
  ChartColumnIncreasing,
  ChartSpline,
  Clock5,
  LayoutDashboard,
  LayoutList,
  ListCollapse,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

export const SidebarItems = () => {
  const t = useTranslations('general')

  return [
    {
      title: t('kpi'),
      icon: <ChartSpline className="size-4 min-w-4" />,
      href: '/',
    },
    {
      title: t('kpi-analysis'),
      icon: <ChartColumnIncreasing className="size-4 min-w-4" />,
      href: '/kpi-analysis',
    },
    {
      title: t('kpi-status'),
      icon: <Clock5 className="size-4 min-w-4" />,
      href: '/kpi-status',
    },
    {
      title: t('dimension-definition'),
      icon: <ListCollapse className="size-4 min-w-4" />,
      permissions: ['superAdmin', 'moderator', 'contributor'],
      href: '/dimension-definition',
      submenu: [
        {
          title: 'status-description',
          href: '/dimension-definition/status',
        },
        {
          title: 'audit-status',
          href: '/dimension-definition/audit-status',
        },
        {
          title: 'processes',
          href: '/dimension-definition/processes',
        },
        {
          title: 'compliances',
          href: '/dimension-definition/compliances',
        },
        {
          title: 'objectives',
          href: '/dimension-definition/objectives',
        },
        {
          title: 'task-status',
          href: '/dimension-definition/task-status',
        },
      ],
    },
    {
      title: t('organizations'),
      icon: <Building2 className="size-4 min-w-4" />,
      href: '/organization',
      permissions: ['superAdmin', 'moderator'],
    },
    {
      title: t('dashboard'),
      icon: <LayoutDashboard className="size-4 min-w-4" />,
      href: '/dashboard',
    },
    {
      title: t('task-management'),
      icon: <LayoutList className="size-4 min-w-4" />,
      href: '/task-management',
    },
    // {
    //   title: t('frameworks'),
    //   icon: <BadgeCheck className="size-4 min-w-4" />,
    //   href: '/indicators',
    // },
    {
      title: t('compliance-frameworks'),
      icon: <BadgeCheck className="size-4 min-w-4" />,
      href: '/frameworks',
    },
  ]
}
