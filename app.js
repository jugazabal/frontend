import express from 'express'
import mongoose, { connect } from 'mongoose'
import path from 'path'
import { readFile } from 'fs/promises'
import { notesRouter } from './controllers/notes.js'
import { usersRouter } from './controllers/users.js'
import { loginRouter } from './controllers/login.js'
import { commonMiddleware, unknownEndpoint, errorHandler, distPath } from './utils/middleware.js'
import { MONGODB_URI } from './utils/config.js'
import { info, warn, error } from './utils/logger.js'

const app = express()

// Apply common middleware
commonMiddleware.forEach(mw => app.use(mw))

const indexFile = path.join(distPath, 'index.html')

async function sendIndex(res, allowFallback = false) {
  try {
    await readFile(indexFile, 'utf8')
    return res.sendFile(indexFile)
  } catch (err) {
    if (allowFallback) {
      return res.send('<h1>Notes App Backend</h1><p>Build the frontend to serve the React app.</p>')
    }
    throw err
  }
}

// Redirect bare root to the SPA base path to align with Vite base
app.get('/', (_req, res) => {
  res.redirect(302, '/frontend/')
})

// Serve static assets under the base path used by Vite
app.use('/frontend', express.static(distPath))

// SPA fallback for any frontend route when static assets miss
app.get(/^\/frontend(\/.*)?$/, async (_req, res, next) => {
  return sendIndex(res, true).catch(next)
})

// Health endpoint
import { Note } from './models/note.js'
app.get('/health', async (_req, res) => {
  try {
    const count = await Note.countDocuments()
    res.json({ status: 'ok', notes: count })
  } catch (err) {
    console.error('Health check error:', err.message)
    res.json({ status: 'degraded', notes: null })
  }
})

// API routes
app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)
app.use('/api/notes', notesRouter)

// Any other non-API route falls back to SPA entry (with simple message if build missing)
app.get(/^(?!\/api).*/, async (_req, res, next) => {
  return sendIndex(res, true).catch(next)
})

// 404 and error handlers
app.use(unknownEndpoint)
app.use(errorHandler)

export async function initDatabase() {
  if (!MONGODB_URI) {
    warn('MONGODB_URI not set. Database operations will fail.')
    return
  }
  try {
    await connect(MONGODB_URI)
    info('Connected to MongoDB')
    mongoose.connection.on('disconnected', () => console.log('DB disconnected'))
    mongoose.connection.on('error', (err) => console.error('DB error:', err.message))
  } catch (err) {
    error('MongoDB connection error:', err.message)
  }
}

export default app
