/* eslint-env node */
import process from 'process'
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import { Note } from './models/note.js'

const app = express()

// Resolve dirname (ESM)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Mongo connection
const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
	console.warn('WARNING: MONGODB_URI not set. Routes will fail until provided.')
}

async function connectMongo() {
	if (!MONGODB_URI) return
	try {
		await mongoose.connect(MONGODB_URI)
		console.log('Connected to MongoDB')
	} catch (err) {
		console.error('MongoDB connection error:', err.message)
	}
}

// Middleware
const githubPagesOrigin = 'https://jugazabal.github.io'
const allowListFromEnv = (process.env.ALLOWED_ORIGINS || '')
	.split(',')
	.map(o => o.trim())
	.filter(Boolean)
const allowedOrigins = allowListFromEnv.length
	? Array.from(new Set([...allowListFromEnv, githubPagesOrigin]))
	: []
const corsOptions = {
	origin: (origin, callback) => {
		if (!origin) return callback(null, true)
		if (!allowedOrigins.length) return callback(null, true)
		if (allowedOrigins.includes(origin)) return callback(null, true)
		console.warn(`Blocked CORS origin: ${origin}`)
		return callback(new Error('Not allowed by CORS'))
	}
}
app.use(cors(corsOptions))
app.use(express.json())
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// Static frontend if built
const distPath = path.join(__dirname, 'dist')
app.use(express.static(distPath))
app.get('/', (req, res) => {
	const indexFile = path.join(distPath, 'index.html')
	import('fs/promises').then(fs => {
		fs.readFile(indexFile, 'utf8')
			.then(() => res.sendFile(indexFile))
			.catch(() => res.send('<h1>Notes App Backend</h1><p>Build the frontend to serve the React app.</p>'))
	})
})

// Health
app.get('/health', async (_req, res) => {
	try {
		const count = await Note.countDocuments()
		res.json({ status: 'ok', notes: count })
	} catch { res.json({ status: 'degraded', notes: null }) }
})

// Routes
app.get('/api/notes', async (_req, res, next) => {
	try {
		const notes = await Note.find({})
		res.json(notes.map(n => n.toJSON()))
	} catch (err) { next(err) }
})

app.get('/api/notes/:id', async (req, res, next) => {
	try {
		const note = await Note.findById(req.params.id)
		if (!note) return res.status(404).end()
		res.json(note.toJSON())
	} catch (err) { next(err) }
})

app.post('/api/notes', async (req, res, next) => {
	try {
		const { content, important } = req.body || {}
		if (!content || !content.trim()) {
			return res.status(400).json({ error: 'content missing' })
		}
		const note = await Note.create({ content: content.trim(), important: Boolean(important) })
		res.status(201).json(note.toJSON())
	} catch (err) { next(err) }
})

app.put('/api/notes/:id', async (req, res, next) => {
	try {
		const body = req.body || {}
		if (body.content === undefined && body.important === undefined) {
			return res.status(400).json({ error: 'nothing to update' })
		}
		const update = {}
		if (body.content !== undefined) update.content = body.content
		if (body.important !== undefined) update.important = body.important
		const updated = await Note.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
		if (!updated) return res.status(404).json({ error: 'note not found' })
		res.json(updated.toJSON())
	} catch (err) { next(err) }
})

app.delete('/api/notes/:id', async (req, res, next) => {
	try {
		const deleted = await Note.findByIdAndDelete(req.params.id)
		if (!deleted) return res.status(404).end()
		res.status(204).end()
	} catch (err) { next(err) }
})

// SPA fallback
app.get(/^(?!\/api).*/, (req, res, next) => {
	const indexFile = path.join(distPath, 'index.html')
	import('fs/promises').then(fs => {
		fs.readFile(indexFile, 'utf8')
			.then(() => res.sendFile(indexFile))
			.catch(() => next())
	})
})

// 404
app.use((_req, res) => {
	res.status(404).json({ error: 'unknown endpoint' })
})

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((error, _req, res, _next) => {
	console.error(error.name, error.message)
	if (error.name === 'CastError') {
		return res.status(400).json({ error: 'malformatted id' })
	}
	if (error.name === 'ValidationError') {
		return res.status(400).json({ error: error.message })
	}
	res.status(500).json({ error: 'internal server error' })
})

async function start() {
	await connectMongo()
	const PORT = process.env.PORT || 3001
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`)
	})
}

start()
