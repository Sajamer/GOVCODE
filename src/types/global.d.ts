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
