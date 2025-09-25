import express from 'express'
const app = express()

// Middleware to parse JSON bodies
app.use(express.json())


let notes = [
	{
		id: "1",
		content: "HTML is easy",
		important: true
	},
	{
		id: "2",
		content: "Browser can execute only JavaScript",
		important: false
	},
	{
		id: "3",
		content: "GET and POST are the most important methods of HTTP protocol",
		important: true
	}
]

app.get('/', (request, response) => {
	response.send('<h1>Hello World!</h1>')
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

app.delete('/api/notes/:id', (request, response) => {
	const id = request.params.id
	notes = notes.filter(note => note.id !== id)
	response.status(204).end()
})

app.post('/api/notes', (request, response) => {
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
	response.status(201).json(note)
})

app.put('/api/notes/:id', (request, response) => {
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
	response.json(updated)
})

const PORT = 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
