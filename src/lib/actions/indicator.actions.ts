'use server'

import AttributeType from '@/models/attributeType.model'
import FieldValue from '@/models/fieldValue.model'
import Indicator from '@/models/indicator.model'
import { IIndicatorManipulator } from '@/schema/indicator.schema'
import {
  IField,
  ILevel,
  IMongoField,
  IMongoIndicator,
  IMongoLevel,
} from '@/types/indicator'
import {
  ISerializedField,
  ISerializedIndicator,
  ISerializedLevel,
} from '@/types/serialized'
import mongoose from 'mongoose'
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
    value,
  }
}

const serializeLevel = (level: IMongoLevel): ISerializedLevel => {
  const { _id, levelName, depth, fields, subLevels } = level
  return {
    _id: _id?.toString() || '',
    levelName,
    depth,
    fields: fields?.map(serializeField) || [],
    subLevels:
      subLevels?.map((sublevel) => serializeLevel(sublevel as IMongoLevel)) ||
      [],
  }
}

const serializeIndicator = (
  indicator: IMongoIndicator,
): ISerializedIndicator => {
  const {
    _id,
    name,
    description,
    numberOfLevels,
    levels,
    createdAt,
    updatedAt,
    __v,
  } = indicator
  return {
    _id: _id.toString(),
    name,
    description,
    numberOfLevels,
    levels: levels?.map(serializeLevel) || [],
    createdAt: createdAt?.toISOString(),
    updatedAt: updatedAt?.toISOString(),
    __v: __v || 0,
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

export const getIndicator = async (
  id: string,
): Promise<ISerializedIndicator> => {
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

// New function to get field values for a specific field
export const getFieldValues = async (fieldId: string) => {
  try {
    await connectToMongoDB()
    const fieldValue = await FieldValue.findOne({ fieldId }).lean()
    return fieldValue ? fieldValue.values : []
  } catch (error) {
    sendError(error)
    throw new Error('Error while fetching field values')
  }
}

// New function to save array values for a field
export const saveFieldValues = async (fieldId: string, values: string[]) => {
  try {
    await connectToMongoDB()
    // Use upsert to update if exists or create if doesn't exist
    const fieldValue = await FieldValue.findOneAndUpdate(
      { fieldId },
      {
        fieldId,
        values,
        isArray: true,
      },
      { upsert: true, new: true },
    )
    return fieldValue._id.toString()
  } catch (error) {
    sendError(error)
    throw new Error('Error while saving field values')
  }
}

// Helper function to process fields and save array values if needed
const processFieldWithArrayValues = async (field: IField) => {
  const fieldId = new mongoose.Types.ObjectId()
  let fieldValueId

  // Add debug logging
  console.log('Processing field:', field.attributeName)
  console.log('Field has arrayValues:', !!field.arrayValues)
  if (field.arrayValues) {
    console.log('Array values count:', field.arrayValues.length)
    console.log('Array values:', field.arrayValues)
  }

  // Check if this is an array type field and has array values
  if (field.arrayValues && Array.isArray(field.arrayValues)) {
    // Save array values in FieldValue collection
    fieldValueId = await saveFieldValues(fieldId.toString(), field.arrayValues)
    console.log('Saved fieldValueId:', fieldValueId)
  }

  return {
    _id: fieldId,
    attributeName: field.attributeName,
    type: new mongoose.Types.ObjectId(field.type),
    value: field.value,
    fieldValueId: fieldValueId
      ? new mongoose.Types.ObjectId(fieldValueId)
      : undefined,
  }
}

// Updated prepareLevelData to handle array values
const prepareLevelData = async (
  level: ILevel,
  depth: number = 0,
): Promise<IMongoLevel> => {
  // Process fields and handle array values
  const preparedFields = await Promise.all(
    level.fields.map(processFieldWithArrayValues),
  )

  // Prepare sublevels recursively if they exist
  const preparedSubLevels = level.subLevels?.length
    ? await Promise.all(
        level.subLevels.map((sublevel) =>
          prepareLevelData(sublevel, depth + 1),
        ),
      )
    : []

  // Create the level document with all nested data
  const levelDocument = {
    _id: new mongoose.Types.ObjectId(),
    levelName: level.levelName,
    fields: preparedFields,
    depth,
    subLevels: preparedSubLevels,
  }

  return levelDocument
}

export const createIndicator = async (
  data: IIndicatorManipulator,
): Promise<ISerializedIndicator> => {
  try {
    await connectToMongoDB()

    // Prepare the data with proper ObjectIds for all nested levels
    // and save array values to FieldValue collection
    const indicatorData = {
      ...data,
      levels: await Promise.all(
        data.levels.map((level) => prepareLevelData(level)),
      ),
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
    // and save array values to FieldValue collection
    const indicatorData = {
      ...data,
      levels: await Promise.all(
        data.levels.map((level) => prepareLevelData(level)),
      ),
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

export const deleteIndicator = async (
  id: string,
): Promise<{ success: boolean }> => {
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
