import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true, minlength: 1, trim: true },
  important: { type: Boolean, default: false },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true })

noteSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    if (ret.user && ret.user._id) {
      ret.user.id = ret.user._id.toString()
      delete ret.user._id
      delete ret.user.__v
      delete ret.user.passwordHash
    }
    return ret
  }
})

export const Note = mongoose.model('Note', noteSchema)
