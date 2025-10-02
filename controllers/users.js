import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/user.js'

export const usersRouter = Router()

usersRouter.post('/', async (req, res, next) => {
  try {
    const { username, name, password } = req.body || {}
    if (typeof username !== 'string' || username.trim().length < 3) {
      return res.status(422).json({ error: 'username must be at least 3 characters' })
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(422).json({ error: 'password must be at least 6 characters' })
    }
    const existing = await User.findOne({ username: username.trim() })
    if (existing) {
      return res.status(422).json({ error: 'username already taken' })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({
      username: username.trim(),
      name: name?.trim() || '',
      passwordHash
    })
    res.status(201).json(user.toJSON())
  } catch (err) {
    next(err)
  }
})

usersRouter.get('/', async (_req, res, next) => {
  try {
    const users = await User.find({}).populate('notes', { content: 1, important: 1 })
    res.json(users.map(u => u.toJSON()))
  } catch (err) {
    next(err)
  }
})
