import mongoose from 'mongoose'

const FieldValueSchema = new mongoose.Schema({
  fieldId: { type: mongoose.Schema.Types.ObjectId, required: true },
  values: [{ type: mongoose.Schema.Types.Mixed }], // Can store array of any type
  isArray: { type: Boolean, default: false },
  isObject: { type: Boolean, default: false },
}, {
  timestamps: true
})

// Index for faster lookups by fieldId
FieldValueSchema.index({ fieldId: 1 })

const FieldValue = mongoose.models.FieldValue || mongoose.model('FieldValue', FieldValueSchema)

export default FieldValue
