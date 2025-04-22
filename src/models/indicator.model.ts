import mongoose from 'mongoose'

const FieldSchema = new mongoose.Schema({
  attributeName: { type: String, required: true },
  value: { type: String },
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'AttributeType', required: true },
})

const LevelSchema = new mongoose.Schema({
  levelName: { type: String, required: true },
  fields: [FieldSchema],
  subLevels: [{ type: mongoose.Schema.ObjectId, ref: 'Level' }], // Reference to nested levels
  parentLevel: { type: mongoose.Schema.ObjectId, ref: 'Level', default: null }, // Reference to parent level
  depth: { type: Number, default: 0 }, // Track the nesting depth
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
const Indicator = mongoose.models.Indicator || mongoose.model('Indicator', IndicatorSchema)

export { Level }
export default Indicator
