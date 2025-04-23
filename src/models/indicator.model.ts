import mongoose from 'mongoose'

const FieldSchema = new mongoose.Schema({
  attributeName: { type: String, required: true },
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'AttributeType', required: true },
  value: { type: String },
}, { _id: true })

const LevelSchemaFields = {
  levelName: { type: String, required: true },
  fields: [FieldSchema],
  depth: { type: Number, default: 0 },
  subLevels: {
    type: [{
      levelName: { type: String, required: true },
      fields: [FieldSchema],
      depth: { type: Number },
      subLevels: { type: Array, default: [] }
    }],
    default: []
  }
}

const LevelSchema = new mongoose.Schema(LevelSchemaFields, { 
  _id: true,
  strict: false 
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
