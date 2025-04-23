import { Types } from 'mongoose'

export interface IField {
  attributeName: string
  value?: string
  type: string // MongoDB ObjectId as string
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
  value?: string
  type: Types.ObjectId
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
