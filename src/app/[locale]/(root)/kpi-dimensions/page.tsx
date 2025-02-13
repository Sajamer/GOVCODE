'use client'

import { useTab } from '@/hooks/useTab'
import { FC } from 'react'

const KPIDimensions: FC = () => {
  const tab = useTab()

  switch (tab) {
    case 'processes':
      return <>processes</>
    case 'compliances':
      return <>compliances</>
    case 'objectives':
      return <>objectives</>
    default:
      return <></>
  }
}

export default KPIDimensions
