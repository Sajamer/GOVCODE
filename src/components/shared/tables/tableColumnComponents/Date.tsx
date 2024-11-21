import moment from 'moment'
import { FC } from 'react'

interface IDateProps {
  date: string
}

const Date: FC<IDateProps> = ({ date }) => {
  const formattedDate = moment(date).format('DD MMM YYYY')

  return (
    <div className="flex w-fit flex-col">
      <div className="text-sm font-medium text-zinc-800">{formattedDate}</div>
    </div>
  )
}

export default Date
