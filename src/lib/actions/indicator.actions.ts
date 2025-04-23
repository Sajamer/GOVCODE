'use server'

import mongoose from 'mongoose'
import AttributeType from '@/models/attributeType.model'
import Indicator from '@/models/indicator.model'
import { IIndicatorManipulator } from '@/schema/indicator.schema'
import { ILevel, IMongoField, IMongoIndicator, IMongoLevel } from '@/types/indicator'
import { ISerializedField, ISerializedIndicator, ISerializedLevel } from '@/types/serialized'
import connectToMongoDB from '../mongodb'
import { sendError } from '../utils'

interface IAttributeType {
  _id: string
  name: string
  description?: string
}

const serializeField = (field: IMongoField): ISerializedField => {
  const { _id, type, attributeName, value } = field
  return {
    _id: _id?.toString() || '',
    type: type?.toString() || '',
    attributeName,
    value
  }
}

const serializeLevel = (level: IMongoLevel): ISerializedLevel => {
  const { _id, levelName, depth, fields, subLevels } = level
  return {
    _id: _id?.toString() || '',
    levelName,
    depth,
    fields: fields?.map(serializeField) || [],
    subLevels: subLevels?.map(sublevel => serializeLevel(sublevel as IMongoLevel)) || []
  }
}

const serializeIndicator = (indicator: IMongoIndicator): ISerializedIndicator => {
  const { _id, name, description, numberOfLevels, levels, createdAt, updatedAt, __v } = indicator
  return {
    _id: _id.toString(),
    name,
    description,
    numberOfLevels,
    levels: levels?.map(serializeLevel) || [],
    createdAt: createdAt?.toISOString(),
    updatedAt: updatedAt?.toISOString(),
    __v: __v || 0
  }
}

export const getAttributeTypes = async (): Promise<IAttributeType[]> => {
  try {
    await connectToMongoDB()
    const types = await AttributeType.find({}).lean()
    return types.map((type) => ({
      _id: String(type._id),
      name: type.name,
      description: type.description,
    }))
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching attribute types')
  }
}

export const getAllIndicators = async (
  searchParams?: Record<string, string>,
): Promise<ISerializedIndicator[]> => {
  try {
    await connectToMongoDB()

    const params = searchParams || {}
    const limit = +(params?.limit ?? '10')
    const page = +(params?.page ?? '1')
    const skip = (page - 1) * limit

    const indicatorsData = (await Indicator.find({})
      .skip(skip)
      .limit(limit)
      .lean()) as IMongoIndicator[]

    return indicatorsData.map(serializeIndicator)
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching indicators.')
  }
}

export const getIndicator = async (id: string): Promise<ISerializedIndicator> => {
  try {
    await connectToMongoDB()
    const indicator = (await Indicator.findById(id).lean()) as IMongoIndicator

    if (!indicator) {
      throw new Error('Indicator not found')
    }

    return serializeIndicator(indicator)
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching indicator')
  }
}

// Helper function to prepare level data with proper ObjectIds
const prepareLevelData = (level: ILevel, depth: number = 0): IMongoLevel => {
  // Prepare fields first
  const preparedFields = level.fields.map(field => ({
    _id: new mongoose.Types.ObjectId(),
    attributeName: field.attributeName,
    type: new mongoose.Types.ObjectId(field.type),
    value: field.value
  }))

  // Prepare sublevels recursively if they exist
  const preparedSubLevels = level.subLevels?.map(sublevel => 
    prepareLevelData(sublevel, depth + 1)
  ) || []

  // Create the level document with all nested data
  const levelDocument = {
    _id: new mongoose.Types.ObjectId(),
    levelName: level.levelName,
    fields: preparedFields,
    depth,
    subLevels: preparedSubLevels
  }

  return levelDocument
}

export const createIndicator = async (data: IIndicatorManipulator): Promise<ISerializedIndicator> => {
  try {
    await connectToMongoDB()
    
    // Prepare the data with proper ObjectIds for all nested levels
    const indicatorData = {
      ...data,
      levels: data.levels.map(prepareLevelData)
    }
    
    const newIndicator = await Indicator.create(indicatorData)
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
): Promise<ISerializedIndicator> => {
  try {
    await connectToMongoDB()
    
    // Prepare the data with proper ObjectIds for all nested levels
    const indicatorData = {
      ...data,
      levels: data.levels.map(prepareLevelData)
    }
    
    const updatedIndicator = (await Indicator.findByIdAndUpdate(
      id,
      { $set: indicatorData },
      { new: true },
    ).lean()) as IMongoIndicator

    if (!updatedIndicator) {
      throw new Error('Indicator not found')
    }

    return serializeIndicator(updatedIndicator)
  } catch (error) {
    sendError(error)
    throw new Error('Error while updating indicator')
  }
}

export const deleteIndicator = async (id: string): Promise<{ success: boolean }> => {
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
