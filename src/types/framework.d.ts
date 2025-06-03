export interface IFrameworkAttribute {
  id: string
  name: string
  value: string | null
  frameworkId?: string
  parentId?: string | null
  children?: IFrameworkAttribute[]
  rowIndex?: number
  colIndex?: number
}

export interface IFramework {
  id: string
  name: string
  attributes: IFrameworkAttribute[]
}
