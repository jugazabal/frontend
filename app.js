import express from 'express'
import { connect } from 'mongoose'
import { notesRouter } from './controllers/notes.js'
import { commonMiddleware, unknownEndpoint, errorHandler, distPath } from './utils/middleware.js'
import path from 'path'
import { MONGODB_URI } from './utils/config.js'
import { info, warn, error } from './utils/logger.js'

const app = express()

// Apply common middleware
commonMiddleware.forEach(mw => app.use(mw))

// Root / (optional static index fallback already handled by express.static)
app.get('/', (req, res, next) => {
  const indexFile = path.join(distPath, 'index.html')
  import('fs/promises').then(fs => {
    fs.readFile(indexFile, 'utf8')
      .then(() => res.sendFile(indexFile))
      .catch(() => res.send('<h1>Notes App Backend</h1><p>Build the frontend to serve the React app.</p>'))
  }).catch(next)
})

// Health endpoint
import { Note } from './models/note.js'
app.get('/health', async (_req, res) => {
  try {
    const count = await Note.countDocuments()
    res.json({ status: 'ok', notes: count })
  } catch { res.json({ status: 'degraded', notes: null }) }
})

// API routes
app.use('/api/notes', notesRouter)

// SPA fallback (after API) - any GET not starting with /api
app.get(/^(?!\/api).*/, (req, res, next) => {
  const indexFile = path.join(distPath, 'index.html')
  import('fs/promises').then(fs => {
    fs.readFile(indexFile, 'utf8')
      .then(() => res.sendFile(indexFile))
      .catch(() => next())
  }).catch(next)
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
  } catch (err) {
    error('MongoDB connection error:', err.message)
  }
}

export default app
