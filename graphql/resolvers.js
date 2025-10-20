import { GraphQLError } from 'graphql'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import process from 'process'
import { Note } from '../models/note.js'
import { User } from '../models/user.js'

const { JWT_SECRET = 'development-secret', TOKEN_EXPIRES_IN = '1h' } = process.env

export const resolvers = {
  Query: {
    noteCount: async () => Note.countDocuments(),
    allNotes: async (_root, args) => {
      const filter = {}
      if (args.importance === 'YES') {
        filter.important = true
      } else if (args.importance === 'NO') {
        filter.important = false
      }
      const notes = await Note.find(filter).sort({ createdAt: -1 }).populate('user', { username: 1, name: 1 })
      return notes
    },
    findNote: async (_root, { id }) => {
      const note = await Note.findById(id).populate('user', { username: 1, name: 1 })
      return note
    },
    allUsers: async () => {
      const users = await User.find({}).populate('notes', { content: 1, important: 1, createdAt: 1, updatedAt: 1 })
      return users
    },
    me: (_root, _args, context) => context.currentUser
  },
  Mutation: {
    addNote: async (_root, { content, important }, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }
      if (typeof content !== 'string' || !content.trim()) {
        throw new GraphQLError('content must be a non-empty string', {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: ['content'] }
        })
      }
      const trimmed = content.trim()
      if (trimmed.length > 500) {
        throw new GraphQLError('content exceeds 500 characters', {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: ['content'] }
        })
      }
      const duplicate = await Note.findOne({ content: trimmed }).collation({ locale: 'en', strength: 2 })
      if (duplicate) {
        throw new GraphQLError('duplicate note content', {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: ['content'] }
        })
      }
      const note = await Note.create({ content: trimmed, important: important === true, user: currentUser._id })
      currentUser.notes.push(note._id)
      await currentUser.save()
  await note.populate('user', { username: 1, name: 1 })
  return note
    },
    toggleImportance: async (_root, { id }, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }
      const note = await Note.findById(id)
      if (!note) {
        throw new GraphQLError('note not found', {
          extensions: { code: 'NOT_FOUND', invalidArgs: ['id'] }
        })
      }
      if (note.user.toString() !== currentUser._id.toString()) {
        throw new GraphQLError('forbidden', {
          extensions: { code: 'FORBIDDEN' }
        })
      }
      note.important = !note.important
      await note.save()
  await note.populate('user', { username: 1, name: 1 })
  return note
    },
    deleteNote: async (_root, { id }, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }
      const note = await Note.findById(id)
      if (!note) {
        throw new GraphQLError('note not found', {
          extensions: { code: 'NOT_FOUND', invalidArgs: ['id'] }
        })
      }
      if (note.user.toString() !== currentUser._id.toString()) {
        throw new GraphQLError('forbidden', {
          extensions: { code: 'FORBIDDEN' }
        })
      }
      await note.deleteOne()
      await User.findByIdAndUpdate(currentUser._id, { $pull: { notes: note._id } })
      return true
    },
    addComment: async (_root, { id, comment }) => {
      if (typeof comment !== 'string' || !comment.trim()) {
        throw new GraphQLError('comment must be a non-empty string', {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: ['comment'] }
        })
      }
      const sanitizedComment = comment.trim()
      if (sanitizedComment.length > 300) {
        throw new GraphQLError('comment exceeds 300 characters', {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: ['comment'] }
        })
      }
      const note = await Note.findById(id)
      if (!note) {
        throw new GraphQLError('note not found', {
          extensions: { code: 'NOT_FOUND', invalidArgs: ['id'] }
        })
      }
      note.comments = note.comments || []
      note.comments.push(sanitizedComment)
      await note.save()
      await note.populate('user', { username: 1, name: 1 })
      return note
    },
    createUser: async (_root, { username, name, password }) => {
      if (typeof username !== 'string' || username.trim().length < 3) {
        throw new GraphQLError('username must be at least 3 characters', {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: ['username'] }
        })
      }
      if (typeof password !== 'string' || password.length < 6) {
        throw new GraphQLError('password must be at least 6 characters', {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: ['password'] }
        })
      }
      const normalizedUsername = username.trim()
      const existing = await User.findOne({ username: normalizedUsername })
      if (existing) {
        throw new GraphQLError('username already taken', {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: ['username'] }
        })
      }
      const passwordHash = await bcrypt.hash(password, 10)
      const user = await User.create({
        username: normalizedUsername,
        name: name?.trim() || '',
        passwordHash
      })
      return user
    },
    login: async (_root, { username, password }) => {
      const user = await User.findOne({ username })
      const passwordCorrect = user && await bcrypt.compare(password, user.passwordHash)
      if (!user || !passwordCorrect) {
        throw new GraphQLError('invalid username or password', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }
      const userForToken = {
        username: user.username,
        id: user._id.toString()
      }
      const token = jwt.sign(userForToken, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN })
      return { token, user }
    }
  },
  Note: {
    id: (note) => {
      if (note.id) return note.id
      if (note._id) return note._id.toString()
      return null
    },
    createdAt: (note) => {
      if (!note.createdAt) return null
      return note.createdAt instanceof Date ? note.createdAt.toISOString() : note.createdAt
    },
    updatedAt: (note) => {
      if (!note.updatedAt) return null
      return note.updatedAt instanceof Date ? note.updatedAt.toISOString() : note.updatedAt
    },
    comments: (note) => {
      if (!Array.isArray(note.comments)) {
        return []
      }
      return note.comments
    },
    user: async (note) => {
      if (!note.user) return null
      if (typeof note.user === 'object' && note.user.username) {
        return note.user
      }
      return User.findById(note.user)
    }
  },
  User: {
    notes: async (user) => {
      if (!user.notes) return []
      if (Array.isArray(user.notes) && user.notes.length > 0 && typeof user.notes[0] === 'object' && user.notes[0].content) {
        return user.notes
      }
      const userId = user.id || (user._id ? user._id.toString() : null)
      if (!userId) return []
      const notes = await Note.find({ user: userId }).sort({ createdAt: -1 })
      return notes
    }
  }
}
