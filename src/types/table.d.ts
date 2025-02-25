type CellType =
  | 'string'
  | 'icon'
  | 'number'
  | 'boolean'
  | 'date'
  | 'stack'
  | 'country'
  | 'timezone'
  | 'created_date'
  | 'custom'
  | 'translated'
  | 'priority'
  | 'status'

interface ITableHeader<T> {
  isSortable: boolean
  key: keyof T | 'actions'
}

interface ITableCell<T> {
  value: React.JSX.Element | T[keyof T]
  type: CellType
  id: number | null | undefined
}

interface ITableRow<T extends object> {
  cells: ITableCell<T>[] // Array of cells within the row
  original: T // The original row data
}

interface IGroupedTableData extends ITableCell<T> {
  account_type: string
}

type GenerateTable = <T>(
  data: T[],
  headers: Array<{
    key: keyof T
    isSortable?: boolean
    type: CellType
  }>,
) => {
  headers: Array<ITableHeader<T>>
  values: Array<ITableCell<T>[]>
}

type TimeZone = {
  id: number
  timezone: string
  timezone_name: string
  utc_offset: string
}

interface IIdObject {
  id?: number
}

interface IColumn {
  key: string
  isSortable: boolean
  type: CellType
}
