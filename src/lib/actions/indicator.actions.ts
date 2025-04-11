'use server'

import { Types } from 'mongoose'
import Indicator from '@/models/indicator.model'
import AttributeType from '@/models/attributeType.model'
import { IIndicatorManipulator } from '@/schema/indicator.schema'
import connectToMongoDB from '../mongodb'
import { sendError } from '../utils'
import { IMongoField, IMongoIndicator, IMongoLevel } from '@/types/indicator'

interface IAttributeType {
  _id: string
  name: string
  description?: string
}


const serializeIndicator = (indicator: IMongoIndicator) => ({
  ...indicator,
  _id: indicator._id.toString(),
  createdAt: indicator.createdAt?.toISOString(),
  updatedAt: indicator.updatedAt?.toISOString(),
  levels: indicator.levels?.map((level: IMongoLevel) => ({
    ...level,
    _id: level._id.toString(),
    fields: level.fields?.map((field: IMongoField) => ({
      ...field,
      _id: field._id.toString(),
      type: field.type?.toString()
    }))
  }))
})

export const getAttributeTypes = async (): Promise<IAttributeType[]> => {
  try {
    await connectToMongoDB()
    const types = await AttributeType.find({}).lean()
    return types.map(type => ({
      _id: String(type._id),
      name: type.name,
      description: type.description
    }))
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching attribute types')
  }
}

export const getAllIndicators = async (
  searchParams?: Record<string, string>,
) => {
  try {
    await connectToMongoDB()

    const params = searchParams || {}
    const limit = +(params?.limit ?? '10')
    const page = +(params?.page ?? '1')
    const skip = (page - 1) * limit

    const indicatorsData = await Indicator.find({})
      .skip(skip)
      .limit(limit)
      .lean() as IMongoIndicator[]

    return indicatorsData.map(serializeIndicator)
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching indicators.')
  }
}

export const getIndicator = async (id: string) => {
  try {
    await connectToMongoDB()
    const indicator = await Indicator.findById(id).lean() as IMongoIndicator

    if (!indicator) {
      throw new Error('Indicator not found')
    }

    return serializeIndicator(indicator)
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching indicator')
  }
}

export const createIndicator = async (data: IIndicatorManipulator) => {
  try {
    await connectToMongoDB()

    const newIndicator = await Indicator.create(data)
    const indicatorObject = newIndicator.toObject() as IMongoIndicator

    return serializeIndicator(indicatorObject)
  } catch (error) {
    sendError(error)
    throw new Error('Error while creating indicator')
  }
}

export const updateIndicator = async (
  id: string,
  data: IIndicatorManipulator,
) => {
  try {
    await connectToMongoDB()
    const updatedIndicator = await Indicator.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    ).lean() as IMongoIndicator

    if (!updatedIndicator) {
      throw new Error('Indicator not found')
    }

    return serializeIndicator(updatedIndicator)
  } catch (error) {
    sendError(error)
    throw new Error('Error while updating indicator')
  }
}

export const deleteIndicator = async (id: string) => {
  try {
    await connectToMongoDB()
    const deletedIndicator = await Indicator.findByIdAndDelete(id)

    if (!deletedIndicator) {
      throw new Error('Indicator not found')
    }

    return { success: true }
  } catch (error) {
    sendError(error)
    throw new Error('Error while deleting indicator')
  }
}
