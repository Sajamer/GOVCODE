/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
// import { Prisma } from '@prisma/client'
import { ordinals } from '@/constants/global-constants'
import { IFrameworkAttribute } from '@/types/framework'
import { Calibration, Prisma, Units } from '@prisma/client'
import { type ClassValue, clsx } from 'clsx'
import { createHash, pbkdf2Sync, randomBytes } from 'crypto'
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
    case Units.TIME:
      return 'Time'
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

export const hashPassword = async (
  password: string,
  salt: string,
): Promise<string> => {
  const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return hash
}

export const generateSalt = async (): Promise<string> => {
  return randomBytes(16).toString('hex')
}

export const createHashedPassword = async (
  password: string,
): Promise<{ salt: string; hash: string }> => {
  const salt = await generateSalt()
  const hash = await hashPassword(password, salt)
  return { salt, hash }
}

export const comparePasswords = async (
  password: string,
  salt: string,
  hash: string,
): Promise<boolean> => {
  const newHash = await hashPassword(password, salt)
  return newHash === hash
}

export const generateHash = (data: Record<string, unknown>): string => {
  return createHash('sha256').update(JSON.stringify(data)).digest('hex')
}

export const findMatchingRule = (
  actual: number,
  target: number,
  rules?: IRules[],
): IRules | undefined => {
  if (!rules?.length) return undefined

  return rules.find((rule) => actual >= rule.min && actual <= rule.max)
}

export const getNestedError = (errors: NestedErrors, path: string): string => {
  const parts = path.split('.')
  let current: any = errors

  for (const part of parts) {
    if (!current?.[part]) return ''
    current = current[part]
  }

  return typeof current === 'string' ? current : ''
}

// Helper function to convert number to ordinal text
export const getOrdinalText = (num: number): string => {
  if (num >= 1 && num <= ordinals.length) {
    return ordinals[num - 1]
  }

  // For numbers beyond our predefined list, use numeric with suffix
  const lastDigit = num % 10
  const lastTwoDigits = num % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${num}th`
  }

  switch (lastDigit) {
    case 1:
      return `${num}st`
    case 2:
      return `${num}nd`
    case 3:
      return `${num}rd`
    default:
      return `${num}th`
  }
}

const getAllAttributes = (
  attributes: IFrameworkAttribute[],
): IFrameworkAttribute[] => {
  if (!attributes || attributes.length === 0) return []

  let allAttributes: IFrameworkAttribute[] = [...attributes]

  for (const attribute of attributes) {
    if (attribute.children && attribute.children.length > 0) {
      allAttributes = [
        ...allAttributes,
        ...getAllAttributes(attribute.children),
      ]
    }
  }

  return allAttributes
}

// Helper function to count rows per column using colIndex
export const getColumnRowCounts = (
  attributes: IFrameworkAttribute[],
): { name: string; total: number }[] => {
  const allAttributes = getAllAttributes(attributes)

  // Group attributes by colIndex
  const columnGroups: { [key: number]: IFrameworkAttribute[] } = {}

  allAttributes.forEach((attr) => {
    if (attr.colIndex !== undefined && attr.colIndex !== null) {
      if (!columnGroups[attr.colIndex]) {
        columnGroups[attr.colIndex] = []
      }
      columnGroups[attr.colIndex].push(attr)
    }
  })

  // Convert to array of objects with column name and row count
  return Object.entries(columnGroups)
    .sort(([a], [b]) => parseInt(a) - parseInt(b)) // Sort by column index
    .map(([colIndex, attrs]) => ({
      name: `Sum of the ${getOrdinalText(parseInt(colIndex) + 1)} level`,
      total: attrs.length,
    }))
}
