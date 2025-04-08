import mongoose from 'mongoose'

const AttributeTypeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "date", "number", "text", etc.
  description: { type: String }, // Optional description of the type
})

const AttributeType =
  mongoose.models.AttributeType ||
  mongoose.model('AttributeType', AttributeTypeSchema)

export default AttributeType