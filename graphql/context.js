import jwt from 'jsonwebtoken'
import process from 'process'
import { User } from '../models/user.js'

const { JWT_SECRET = 'development-secret' } = process.env

export const buildContext = async ({ req }) => {
  const authorization = req?.headers?.authorization || ''
  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return { currentUser: null }
  }
  const token = authorization.substring(7)
  try {
    const decodedToken = jwt.verify(token, JWT_SECRET)
    if (!decodedToken?.id) {
      return { currentUser: null }
    }
    const currentUser = await User.findById(decodedToken.id)
    return { currentUser }
  } catch {
    return { currentUser: null }
  }
}
