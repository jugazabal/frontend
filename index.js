/* eslint-env node */
import process from 'process'
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()

// Resolve dirname (ESM)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'notes.json')

// In-memory notes (will be loaded from persistence)
let notes = []

// Middleware
const defaultAllowedOrigins = [
	'http://localhost:5173',
	'http://localhost:4173',
	'https://jugazabal.github.io'
]

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
	.split(',')
	.map(origin => origin.trim())
	.filter(Boolean)

if (!allowedOrigins.length) {
	allowedOrigins.push(...defaultAllowedOrigins)
}

const corsOptions = {
	origin: (origin, callback) => {
		// Allow requests with no origin (mobile apps, curl, etc.)
		if (!origin) return callback(null, true)

		if (!allowedOrigins.length) {
			return callback(null, true)
		}

		if (allowedOrigins.includes(origin)) {
			return callback(null, true)
		}

		console.warn(`Blocked CORS origin: ${origin}`)
		return callback(new Error('Not allowed by CORS'))
	}
}

app.use(cors(corsOptions))
app.use(express.json())

// Morgan request logging including request body (for POST/PUT)
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


// Default seed (used if no persistence file exists)
const seedNotes = [
  { id: '1', content: 'HTML is easy', important: true },
  { id: '2', content: 'Browser can execute only JavaScript', important: false },
  { id: '3', content: 'GET and POST are the most important methods of HTTP protocol', important: true }
]

async function loadNotes() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8')
    notes = JSON.parse(data)
		} catch (error) {
			console.warn('Failed to load notes from persistence, using seed data.', error)
			// Initialize with seed if file missing or invalid
			notes = seedNotes
			await saveNotes()
		}
}

async function saveNotes() {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(notes, null, 2), 'utf8')
}

// Serve built frontend (if dist exists)
const distPath = path.join(__dirname, 'dist')
app.use(express.static(distPath))

app.get('/', (request, response) => {
	// If no dist yet (dev mode), fallback simple message
	const indexFile = path.join(distPath, 'index.html')
	fs.readFile(indexFile, 'utf8')
		.then(() => response.sendFile(indexFile))
		.catch(() => response.send('<h1>Notes App Backend</h1><p>Build the frontend to serve the React app.</p>'))
})


app.get('/health', (req, res) => {
  res.json({ status: 'ok', notes: notes.length })
})

app.get('/api/notes', (request, response) => {
	response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
	const id = request.params.id
	const note = notes.find(note => note.id === id)

	if (note) {
		response.json(note)
	} else {
		response.status(404).end()
	}
})

app.delete('/api/notes/:id', async (request, response, next) => {
	try {
		const id = request.params.id
		const before = notes.length
		notes = notes.filter(note => note.id !== id)
		if (notes.length !== before) {
			await saveNotes()
		}
		response.status(204).end()
	} catch (err) { next(err) }
})

app.post('/api/notes', async (request, response, next) => {
	try {
		const body = request.body
		if (!body.content) {
			return response.status(400).json({ error: 'content missing' })
		}
		const ids = notes.map(n => Number(n.id))
		const maxId = ids.length ? Math.max(...ids) : 0
		const note = {
			id: String(maxId + 1),
			content: body.content,
			important: body.important || false
		}
		notes = notes.concat(note)
		await saveNotes()
		response.status(201).json(note)
	} catch (err) { next(err) }
})

app.put('/api/notes/:id', async (request, response, next) => {
	try {
		const id = request.params.id
		const body = request.body
		const existing = notes.find(n => n.id === id)
		if (!existing) {
			return response.status(404).json({ error: 'note not found' })
		}
		if (body.content === undefined && body.important === undefined) {
			return response.status(400).json({ error: 'nothing to update' })
		}
		const updated = { ...existing, ...body }
		notes = notes.map(n => n.id === id ? updated : n)
		await saveNotes()
		response.json(updated)
	} catch (err) { next(err) }
})

// SPA fallback AFTER API routes (non-API get requests)
app.get(/^(?!\/api).*/, (req, res, next) => {
	const indexFile = path.join(distPath, 'index.html')
	fs.readFile(indexFile, 'utf8')
		.then(() => res.sendFile(indexFile))
		.catch(() => next())
})

// Unknown endpoint handler
app.use((request, response) => {
	response.status(404).json({ error: 'unknown endpoint' })
})

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((error, request, response, next) => {
	console.error(error)
	response.status(500).json({ error: 'internal server error' })
})

async function start() {
  await loadNotes()
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()
