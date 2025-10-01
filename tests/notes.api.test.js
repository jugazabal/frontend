import { beforeAll, afterAll, afterEach, beforeEach, describe, it, expect } from 'vitest'
import process from 'process'
import request from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { Note } from '../models/note.js'

let app
let initDatabase

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongoServer.getUri('noteApp')
  // Dynamic import AFTER env var is set so config reads correct value
  const mod = await import('../app.js')
  app = mod.default
  initDatabase = mod.initDatabase
  await initDatabase()
  // Add initial notes for tests that expect them
  await Note.create({ content: 'HTML is easy', important: false })
  await Note.create({ content: 'Browser can execute only JavaScript', important: true })
})

afterAll(async () => {
  await mongoose.disconnect()
  if (mongoServer) await mongoServer.stop()
})

describe('Notes API', () => {
  it('notes are returned as json', async () => {
    await request(app)
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  it('creates a note', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({ content: 'Integration test note', important: true })
      .expect(201)
    expect(res.body.content).toBe('Integration test note')
    expect(res.body.important).toBe(true)

    const list = await request(app).get('/api/notes').expect(200)
    expect(list.body).toHaveLength(1)
  })

  it('rejects empty content', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({ content: '   ' })
      .expect(422)
    expect(res.body.error).toMatch(/non-empty/i)
  })

  it('enforces maxlength 500', async () => {
    const longText = 'a'.repeat(501)
    const res = await request(app)
      .post('/api/notes')
      .send({ content: longText })
      .expect(422)
    expect(res.body.error).toMatch(/exceeds 500/i)
  })

  it('prevents duplicate content', async () => {
    await request(app).post('/api/notes').send({ content: 'dup' }).expect(201)
    const res = await request(app).post('/api/notes').send({ content: 'dup' }).expect(422)
    expect(res.body.error).toMatch(/duplicate/i)
  })

  it('updates importance flag', async () => {
    const created = await request(app).post('/api/notes').send({ content: 'flip', important: false })
    const id = created.body.id
    const updated = await request(app).put(`/api/notes/${id}`).send({ important: true }).expect(200)
    expect(updated.body.important).toBe(true)
  })

  it('deletes a note', async () => {
    const created = await request(app).post('/api/notes').send({ content: 'to delete' })
    const id = created.body.id
    await request(app).delete(`/api/notes/${id}`).expect(204)
    await request(app).get(`/api/notes/${id}`).expect(404)
  })

  afterEach(async () => {
    await Note.deleteMany({})
  })
})

describe('Notes API with initial data', () => {
  const initialNotes = [
    {
      content: 'HTML is easy',
      important: false,
    },
    {
      content: 'Browser can execute only JavaScript',
      important: true,
    },
  ]

  beforeEach(async () => {
    await Note.deleteMany({})
    let noteObject = new Note(initialNotes[0])
    await noteObject.save()
    noteObject = new Note(initialNotes[1])
    await noteObject.save()
  })

  it('all notes are returned', async () => {
    const response = await request(app).get('/api/notes')
    expect(response.body).toHaveLength(2)
  })

  it('a specific note is within the returned notes', async () => {
    const response = await request(app).get('/api/notes')
    const contents = response.body.map(e => e.content)
    expect(contents).toContain('HTML is easy')
  })
})