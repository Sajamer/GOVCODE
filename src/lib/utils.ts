/* eslint-disable no-console */
// import { Prisma } from '@prisma/client'
import { Calibration, Prisma, Units } from '@prisma/client'
import { type ClassValue, clsx } from 'clsx'
import moment from 'moment'
import { cloneElement } from 'react'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export const detectArabic = (text: string): boolean => {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/
  return arabicPattern.test(text)
}

export async function sendError(e: unknown): Promise<void> {
  const embed: {
    type?: 'rich'
    title?: string
    description?: string | unknown
    color?: number
    fields?: {
      name?: string
      value?: string
      inline?: boolean
    }[]
    timestamp?: string
  } = {}

  try {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      embed.title = 'Prisma Known Error'
      embed.description = e.name
      embed.color = 0xff0000
      embed.timestamp = new Date().toISOString()
      embed.fields = [
        { name: 'Error Code', value: e.code, inline: false },
        {
          name: 'Stack',
          value: e.stack?.substring(0, 1000) || 'No stack trace available',
          inline: false,
        },
        { name: 'Error Message', value: e.message, inline: false },
      ]
    } else if (e instanceof Prisma.PrismaClientUnknownRequestError) {
      embed.title = 'Prisma Unknown Error'
      embed.description = e.name
      embed.color = 0xff0000
      embed.timestamp = new Date().toISOString()
      embed.fields = [
        {
          name: 'Stack',
          value: e.stack?.substring(0, 1000) || 'No stack trace available',
          inline: false,
        },
        { name: 'Error Message', value: e.message, inline: false },
      ]
    } else if (e instanceof Error) {
      embed.title = 'Error'
      embed.color = 0xff0000
      embed.timestamp = new Date().toISOString()
      embed.fields = [
        { name: 'Error Message', value: e.message, inline: false },
        {
          name: 'Stack',
          value: e.stack?.substring(0, 1000) || 'No stack trace available',
          inline: false,
        },
      ]
    } else {
      console.error(e)
      return
    }

    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URI
    if (!discordWebhookUrl) {
      console.error('Discord webhook URL is not defined.')
      return
    }

    const discordMessage = {
      username: 'Gov-code Logger',
      embeds: [embed],
    }

    const response = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordMessage),
    })

    if (!response.ok) {
      console.error(
        'Failed to send error message to Discord:',
        response.statusText,
      )
    }
  } catch (error) {
    sendError(error)
    console.error('Error while sending error to Discord:', error)
  }
}

export function formatDateRange(
  startDate: Date,
  endDate: Date | null = null,
  isCurrent: boolean = false,
): string {
  const startYear = moment(startDate).year()

  if (endDate) {
    const endYear = moment(endDate).year()

    if (startYear === endYear) {
      return `${startYear}`
    }

    return `${endYear} - ${startYear}`
  }

  if (isCurrent) {
    return `Present - ${startYear}`
  }

  return `${startYear}`
}

export const convertToArabicNumerals = (
  number: number | null | undefined,
): string => {
  if (number === null || number === undefined) {
    return ''
  }

  return number
    .toString()
    .replace(/\d/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[parseInt(digit, 10)])
    .replace(/\./g, '٫')
}

export const formatDateToArabic = (dateString: string): string => {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.toLocaleDateString('ar-EG', { month: 'long' })
  const year = date.getFullYear()
  return `${convertToArabicNumerals(
    day,
  )} ، ${month} ، ${convertToArabicNumerals(year)}`
}

export function getCurrentWeek(): { startOfWeek: Date; endOfWeek: Date } {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const startOfWeek = new Date(now.setDate(diff))
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return { startOfWeek, endOfWeek }
}

export const dataUrlToFile = async (
  dataUrl: string,
  fileName: string,
): Promise<File> => {
  const res: Response = await fetch(dataUrl)
  const blob: Blob = await res.blob()
  return new File([blob], fileName, { type: 'image/png' })
}

export const extractUsernameFromUrl = (url: string): string => {
  const parts = url.split('/').filter(Boolean)
  return parts[parts.length - 1]
}

export function generateTableData<T extends object>(
  data: T[],
  headersConfig: Array<{
    key: keyof T | 'actions'
    isSortable: boolean
    type: CellType
    render?: (row: T) => React.JSX.Element
  }>,
): {
  headers: Array<ITableHeader<T>>
  values: Array<ITableRow<T>>
  originalData: T[]
} {
  const headers = headersConfig.map((header) => ({
    isSortable: header.isSortable ?? false,
    key: header.key,
  }))

  const values = data.map((row) => ({
    cells: headersConfig.map((header) => {
      const cellValue = header.render
        ? header.render(row)
        : row[header.key as keyof T]
      return {
        value: cellValue,
        type: header.type,
        id: 'id' in (row as IIdObject) ? (row as IIdObject).id : null,
      }
    }),
    original: row,
  }))

  return {
    headers,
    values,
    originalData: data,
  }
}

export const searchObjectValueRecursive = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any,
  searchTerm: string,
): boolean => {
  if (typeof obj === 'string') {
    return obj.toLowerCase().includes(searchTerm.toLowerCase())
  }

  if (typeof obj === 'object' && obj !== null) {
    return Object.values(obj).some((value) =>
      searchObjectValueRecursive(value, searchTerm),
    )
  }

  return false
}

export const addClassesToElement = (
  element: React.JSX.Element,
  classes: string,
): React.JSX.Element => {
  return (
    element &&
    cloneElement(element, {
      className: `${element?.props?.className || ''} ${classes}`.trim(),
    })
  )
}

export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject): void => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (): void => {
      resolve(reader.result as string)
    }
    reader.onerror = (error): void => {
      reject(error)
    }
  })
}

export const handleNumberInput = (
  event: React.KeyboardEvent<HTMLInputElement>,
  isDecimal: boolean = false,
  isPhone: boolean = false,
): void => {
  const key = event.key
  const ctrlOrCmd = event.ctrlKey || event.metaKey

  const allowedKeys = [
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
    'Tab',
    'Enter',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
  ]

  if (isDecimal) {
    if (event.currentTarget.value.includes('.') && key === '.')
      event.preventDefault()
    allowedKeys.push('.')
  }

  if (isPhone) {
    allowedKeys.push('+')
    allowedKeys.push('-')

    if (key === '+' && event.currentTarget.value.length > 0) {
      event.preventDefault()
    }

    if (key === '-' && event.currentTarget.value.length < 1) {
      event.preventDefault()
    }
  }

  if (ctrlOrCmd && ['a', 'c', 'v', 'x', 'z', 'y'].includes(key.toLowerCase())) {
    return
  }

  if (!allowedKeys.includes(key)) {
    event.preventDefault()
  }
}

export const switchUnit = (unit: Units): string => {
  switch (unit) {
    case Units.DAYS:
      return 'Days'
    case Units.PERCENTAGE:
      return '%'
    case Units.NUMBER:
      return 'NBR'
    default:
      return '-'
  }
}

export const calculateTrend = (
  defaultTrend: Calibration,
  cy?: number,
  py?: number,
): boolean | undefined => {
  if (cy === undefined || py === undefined) return undefined

  const diff = cy - py
  diff.toFixed(2)
  if (diff > 0 && defaultTrend === Calibration.INCREASING) return true
  else if (diff < 0 && defaultTrend === Calibration.DECREASING) return true
  else return false
}

// Helper function to capitalize first letter
export const capitalizeFirstLetter = (str: string): string => {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as string
}

export const calculateStatus = (
  defaultTrend: Calibration,
  ct?: number,
  ca?: number,
): boolean | undefined => {
  if (ca === undefined || ct === undefined) return undefined

  const diff = ca - ct
  diff.toFixed(2)
  if (diff >= 0 && defaultTrend === Calibration.INCREASING) return true
  else if (diff <= 0 && defaultTrend === Calibration.DECREASING) return true
  else return false
}
