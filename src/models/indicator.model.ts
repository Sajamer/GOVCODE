import mongoose from 'mongoose'

const FieldSchema = new mongoose.Schema({
  attributeName: { type: String, required: true },
  value: { type: String },
})

const LevelSchema = new mongoose.Schema({
  levelName: { type: String, required: true },
  fields: [FieldSchema],
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

const Indicator =
  mongoose.models.Indicator || mongoose.model('Indicator', IndicatorSchema)

export default Indicator
