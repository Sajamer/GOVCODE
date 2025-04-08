import { IIndicatorManipulator } from '@/schema/indicator.schema'

export const transformIndicatorFormData = (formData: IIndicatorManipulator) => {
  return {
    name: formData.name,
    description: formData.description,
    numberOfLevels: formData.numberOfLevels,
    levels: formData.levels.map((level) => ({
      levelName: level.levelName,
      fields: level.fields.map((field) => ({
        attributeName: field.attributeName,
        value: field.value,
        type: field.type
      })),
    })),
  }
}
