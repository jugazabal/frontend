import { Router } from 'express'
import { Note } from '../models/note.js'
import { authenticate } from '../utils/auth.js'
import { User } from '../models/user.js'

export const notesRouter = Router()

// GET all
notesRouter.get('/', async (_req, res, next) => {
  try {
    const notes = await Note.find({}).populate('user', { username: 1, name: 1 })
    res.json(notes.map(n => n.toJSON()))
  } catch (err) { next(err) }
})

// GET one
notesRouter.get('/:id', async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id).populate('user', { username: 1, name: 1 })
    if (!note) return res.status(404).end()
    res.json(note.toJSON())
  } catch (err) { next(err) }
})

// POST create
notesRouter.post('/', authenticate, async (req, res, next) => {
  try {
    const { content, important } = req.body || {}
    if (typeof content !== 'string' || !content.trim()) {
      return res.status(422).json({ error: 'content must be a non-empty string' })
    }
    if (content.trim().length > 500) {
      return res.status(422).json({ error: 'content exceeds 500 characters' })
    }
    // Application-level duplicate guard (case-insensitive)
    const existing = await Note.findOne({ content: content.trim() }).collation({ locale: 'en', strength: 2 })
    if (existing) {
      return res.status(422).json({ error: 'duplicate note content' })
    }
    const user = req.user
    const note = await Note.create({ content: content.trim(), important: important === true, user: user._id })
    user.notes.push(note._id)
    await user.save()
    const populated = await note.populate('user', { username: 1, name: 1 })
    res.status(201).json(populated.toJSON())
  } catch (err) { next(err) }
})

// PUT update
notesRouter.put('/:id', authenticate, async (req, res, next) => {
  try {
    const body = req.body || {}
    if (body.content === undefined && body.important === undefined) {
      return res.status(422).json({ error: 'nothing to update' })
    }
    const update = {}
    if (body.content !== undefined) {
      if (typeof body.content !== 'string' || !body.content.trim()) {
        return res.status(422).json({ error: 'content must be a non-empty string' })
      }
      if (body.content.trim().length > 500) {
        return res.status(422).json({ error: 'content exceeds 500 characters' })
      }
      // If changing content, enforce duplicate rule
      const trimmed = body.content.trim()
      const existing = await Note.findOne({ content: trimmed }).collation({ locale: 'en', strength: 2 })
      if (existing && existing.id !== req.params.id) {
        return res.status(422).json({ error: 'duplicate note content' })
      }
      update.content = trimmed
    }
    if (body.important !== undefined) update.important = body.important === true
    const note = await Note.findById(req.params.id)
    if (!note) return res.status(404).json({ error: 'note not found' })
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'forbidden' })
    }
    Object.assign(note, update)
    await note.save()
    const populated = await note.populate('user', { username: 1, name: 1 })
    res.json(populated.toJSON())
  } catch (err) { next(err) }
})

// DELETE
notesRouter.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note) return res.status(404).end()
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'forbidden' })
    }
    await note.deleteOne()
    await User.findByIdAndUpdate(note.user, { $pull: { notes: note._id } })
    res.status(204).end()
  } catch (err) { next(err) }
})
