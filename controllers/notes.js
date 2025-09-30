import { Router } from 'express'
import { Note } from '../models/note.js'

export const notesRouter = Router()

// GET all
notesRouter.get('/', async (_req, res, next) => {
  try {
    const notes = await Note.find({})
    res.json(notes.map(n => n.toJSON()))
  } catch (err) { next(err) }
})

// GET one
notesRouter.get('/:id', async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note) return res.status(404).end()
    res.json(note.toJSON())
  } catch (err) { next(err) }
})

// POST create
notesRouter.post('/', async (req, res, next) => {
  try {
    const { content, important } = req.body || {}
    if (typeof content !== 'string' || !content.trim()) {
      return res.status(422).json({ error: 'content must be a non-empty string' })
    }
    if (content.trim().length > 500) {
      return res.status(422).json({ error: 'content exceeds 500 characters' })
    }
    const note = await Note.create({ content: content.trim(), important: important === true })
    res.status(201).json(note.toJSON())
  } catch (err) { next(err) }
})

// PUT update
notesRouter.put('/:id', async (req, res, next) => {
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
      update.content = body.content
    }
    if (body.important !== undefined) update.important = body.important === true
    const updated = await Note.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
    if (!updated) return res.status(404).json({ error: 'note not found' })
    res.json(updated.toJSON())
  } catch (err) { next(err) }
})

// DELETE
notesRouter.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Note.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).end()
    res.status(204).end()
  } catch (err) { next(err) }
})
