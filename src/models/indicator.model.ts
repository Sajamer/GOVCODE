/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose'

const FieldSchema = new mongoose.Schema(
  {
    attributeName: { type: String, required: true },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AttributeType',
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed, // Use Mixed type to support different value types
      get: function (data: string) {
        // Handle parsing stored JSON strings for array values
        if (
          typeof data === 'string' &&
          data.startsWith('[') &&
          data.endsWith(']')
        ) {
          try {
            return JSON.parse(data)
          } catch (e) {
            return data
          }
        }
        return data
      },
      set: function (data: any) {
        // Convert arrays to JSON strings when storing
        if (Array.isArray(data)) {
          return JSON.stringify(data)
        }
        return data
      },
    },
    fieldValueId: { type: mongoose.Schema.Types.ObjectId, ref: 'FieldValue' }, // Reference to field values for array types
  },
  { _id: true },
)

const LevelSchemaFields = {
  levelName: { type: String, required: true },
  fields: [FieldSchema],
  depth: { type: Number, default: 0 },
  subLevels: {
    type: [
      {
        levelName: { type: String, required: true },
        fields: [FieldSchema],
        depth: { type: Number },
        subLevels: { type: Array, default: [] },
      },
    ],
    default: [],
  },
}

const LevelSchema = new mongoose.Schema(LevelSchemaFields, {
  _id: true,
  strict: false,
})

const IndicatorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    numberOfLevels: { type: Number, required: true },
    levels: [LevelSchema],
  },
  {
    timestamps: true,
  },
)

const Level = mongoose.models.Level || mongoose.model('Level', LevelSchema)
const Indicator =
  mongoose.models.Indicator || mongoose.model('Indicator', IndicatorSchema)

export { Level }
export default Indicator
