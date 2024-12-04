import { Calibration } from '@prisma/client'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

// Function to switch the calibration trend
export const trendIndicatorSwitch = (trend: Calibration) => {
  switch (trend) {
    case Calibration.INCREASING:
      return <ArrowUpRight className="text-primary" />
    case Calibration.DECREASING:
      return <ArrowDownLeft className="text-destructive" />
    default:
      return <></>
  }
}
