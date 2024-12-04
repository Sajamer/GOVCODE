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

export const statusIndicatorSwitch = (status?: boolean) => {
  switch (status) {
    case true:
      return <div className="size-5 rounded-full bg-primary" />
    case false:
      return <div className="size-5 rounded-full bg-destructive" />
    default:
      return <></>
  }
}
