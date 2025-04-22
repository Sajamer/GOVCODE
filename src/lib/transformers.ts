import { IIndicatorManipulator } from '@/schema/indicator.schema'
import { IField, ILevel } from '@/types/indicator'

const transformLevel = (level: ILevel): ILevel => ({
  levelName: level.levelName,
  fields: level.fields.map((field: IField) => ({
    attributeName: field.attributeName,
    value: field.value,
    type: field.type
  })),
  subLevels: level.subLevels?.map(transformLevel) || [],
  depth: level.depth || 0
})

export const transformIndicatorFormData = (formData: IIndicatorManipulator) => {
  return {
    name: formData.name,
    description: formData.description,
    numberOfLevels: formData.numberOfLevels,
    levels: formData.levels.map(transformLevel),
  }
}
