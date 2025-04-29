import { Types } from 'mongoose'

export interface IField {
  attributeName: string
  value?: string | number | boolean | string[] | Record<string, unknown>
  type: string // MongoDB ObjectId as string
  arrayValues?: string[] // Array of all possible values for dropdown
}

export interface ILevel {
  levelName: string
  fields: IField[]
  subLevels: ILevel[]
  parentLevel?: string // MongoDB ObjectId as string
  depth: number
}

export interface IIndicatorResponse {
  id: number
  name: string
  description: string
  numberOfLevels: number
  levels: ILevel[]
}

export interface IMongoField {
  _id: Types.ObjectId
  attributeName: string
  value?: string | number | boolean | string[] | Record<string, unknown> // Updated to support all value types
  type: Types.ObjectId
  fieldValueId?: Types.ObjectId // Reference to field values in the FieldValue collection
}

export interface IMongoLevel {
  _id: Types.ObjectId
  levelName: string
  fields: IMongoField[]
  subLevels: IMongoLevel[]
  parentLevel?: Types.ObjectId
  depth: number
}

export interface IMongoIndicator {
  _id: Types.ObjectId
  name: string
  description?: string
  numberOfLevels: number
  levels: IMongoLevel[]
  createdAt?: Date
  updatedAt?: Date
  __v: number
}
