import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import process from 'process'
import { User } from '../models/user.js'

const { JWT_SECRET = 'development-secret', TOKEN_EXPIRES_IN = '1h' } = process.env

export const loginRouter = Router()

loginRouter.post('/', async (req, res, next) => {
  try {
    const { username, password } = req.body || {}
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'username and password required' })
    }
    const user = await User.findOne({ username })
    const passwordCorrect = user && await bcrypt.compare(password, user.passwordHash)
    if (!user || !passwordCorrect) {
      return res.status(401).json({ error: 'invalid username or password' })
    }
    const userForToken = {
      username: user.username,
      id: user._id.toString()
    }
    const token = jwt.sign(userForToken, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN })
    res.json({ token, username: user.username, name: user.name })
  } catch (err) {
    next(err)
  }
})
