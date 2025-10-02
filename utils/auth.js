import jwt from 'jsonwebtoken'
import process from 'process'
import { User } from '../models/user.js'

const { JWT_SECRET = 'development-secret' } = process.env

export async function authenticate(req, res, next) {
  try {
    const authorization = req.get('authorization')
    if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
      return res.status(401).json({ error: 'token missing' })
    }
    const token = authorization.substring(7)
    let decodedToken
    try {
      decodedToken = jwt.verify(token, JWT_SECRET)
    } catch {
      return res.status(401).json({ error: 'token invalid' })
    }
    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(decodedToken.id)
    if (!user) {
      return res.status(401).json({ error: 'user not found' })
    }
    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}
