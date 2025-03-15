'use client'

import KpiDimensionCard from '@/components/screens/kpi-dimensions/KpiDimensionCard'
import StatusCard from '@/components/screens/kpi-dimensions/StatusCard'
import { useTab } from '@/hooks/useTab'
import { FC } from 'react'

const KPIDimensions: FC = () => {
  const tab = useTab()

  switch (tab) {
    case 'status description':
      return <StatusCard />
    default:
      return <KpiDimensionCard />
  }
}

export default KPIDimensions
