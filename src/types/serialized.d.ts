import { IMongoField, IMongoLevel, IMongoIndicator } from './indicator'

export interface ISerializedField extends Omit<IMongoField, '_id' | 'type'> {
  _id: string
  type: string
}

export interface ISerializedLevel extends Omit<IMongoLevel, '_id' | 'fields' | 'subLevels'> {
  _id: string
  fields: ISerializedField[]
  subLevels: ISerializedLevel[]
}

export interface ISerializedIndicator extends Omit<IMongoIndicator, '_id' | 'levels' | 'createdAt' | 'updatedAt'> {
  _id: string
  levels: ISerializedLevel[]
  createdAt?: string
  updatedAt?: string
}
