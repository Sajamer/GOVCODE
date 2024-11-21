/* eslint-disable @typescript-eslint/no-explicit-any */
interface ISidebar {
  id: number
  title: string
  href: string
  icon: JSX.Element
  isComingSoon?: boolean
  isDisabled?: boolean
}

interface IIconsProps {
  className?: string
}

type AxiosErrorType = AxiosError<{
  errors: unknown
  message: string
  statusCode: number
}>

interface IValidatedRequest {
  body?: any
  query?: any
  session?: any
}

interface IResponse<T = undefined> {
  data?: T
  message?: string
  status?: number
}

interface IOption {
  label: string
  value: number
}
