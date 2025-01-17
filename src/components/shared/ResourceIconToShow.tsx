import { cn } from '@/lib/utils'
import { FC } from 'react'
import { FileExtension } from '../icons/FileExtension'

export type ResourceType =
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'ppt'
  | 'xls'
  | 'xlsx'
  | 'csv'
  | 'tiff'
  | 'txt'

interface IResourceIconToShowProps {
  type: ResourceType
  iconStyle?: string
}

const ResourceIconToShow: FC<IResourceIconToShowProps> = ({
  type,
  iconStyle,
}) => {
  switch (type) {
    case 'pdf':
      return (
        <FileExtension.Pdf className={cn('h-10 w-[2.1875rem]', iconStyle)} />
      )
    case 'csv':
      return (
        <FileExtension.Csv className={cn('h-10 w-[2.1875rem]', iconStyle)} />
      )
    case 'doc':
    case 'docx':
      return (
        <FileExtension.Doc className={cn('h-10 w-[2.1875rem]', iconStyle)} />
      )
    case 'ppt':
      return (
        <FileExtension.Ppt className={cn('h-10 w-[2.1875rem]', iconStyle)} />
      )
    case 'txt':
    case 'tiff':
      return (
        <FileExtension.Text className={cn('h-10 w-[2.1875rem]', iconStyle)} />
      )
    case 'xls':
    case 'xlsx':
      return (
        <FileExtension.Xls className={cn('h-10 w-[2.1875rem]', iconStyle)} />
      )
    default:
      return (
        <FileExtension.Pdf className={cn('h-10 w-[2.1875rem]', iconStyle)} />
      )
  }
}

export default ResourceIconToShow
