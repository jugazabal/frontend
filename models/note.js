import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true, minlength: 1, trim: true },
  important: { type: Boolean, default: false }
}, { timestamps: true })

noteSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    return ret
  }
})

export const Note = mongoose.model('Note', noteSchema)
