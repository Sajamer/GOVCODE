export interface IField {
  attributeName: string
  value?: string
  type: string // MongoDB ObjectId as string
}

export interface ILevel {
  levelName: string
  fields: IField[]
}

export interface IIndicatorResponse {
  id: number
  name: string
  description: string
  numberOfLevels: number
  levels: ILevel[]
}
