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

type IActionResponse =
  | { error: false; message: string; data: unknown }
  | {
      error: true
      message: string
      errorCode: unknown
    }

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

interface IDropdown {
  id: string
  label: string
  value: string
}

interface ICountryList {
  id: string
  name: string
  flag: string
  isoAlpha2: string
  phoneCode: string
}

interface IBasicDropdown extends IDropdown {
  leftIcon?: React | string
  rightIcon?: React | string
  shortcut?: React
  description?: string
}

interface IMultiSelectOptions {
  id: number
  label: string
  value: string
}

interface IEmailOptions {
  to: string // Recipient email
  subject: string // Email subject
  html: string // Email body as HTML
  from?: string // Optional custom sender
  cc?: string // Optional CC field
  bcc?: string // Optional BCC field
}

interface NestedErrors {
  [key: string]: string | NestedErrors | NestedErrors[]
}
