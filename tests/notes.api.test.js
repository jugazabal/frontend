import { beforeAll, afterAll, afterEach, beforeEach, describe, it, expect } from 'vitest'
import process from 'process'
import request from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { Note } from '../models/note.js'
import { User } from '../models/user.js'
import { expectNotesCount, expectNotesToContain, getNotesCount } from './test_helper.js'

let app
let initDatabase
let authToken
let testUserId

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongoServer.getUri('noteApp')
  // Dynamic import AFTER env var is set so config reads correct value
  const mod = await import('../app.js')
  app = mod.default
  initDatabase = mod.initDatabase
  await initDatabase()
  const userRes = await request(app)
    .post('/api/users')
    .send({ username: 'tester', name: 'Test User', password: 'password123' })
    .expect(201)
  testUserId = userRes.body.id
  const loginRes = await request(app)
    .post('/api/login')
    .send({ username: 'tester', password: 'password123' })
    .expect(200)
  authToken = loginRes.body.token
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
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: 'Integration test note', important: true })
      .expect(201)
    expect(res.body.content).toBe('Integration test note')
    expect(res.body.important).toBe(true)
    expect(res.body.user).toBeDefined()
    expect(res.body.user.id).toEqual(testUserId)

    const list = await request(app).get('/api/notes').expect(200)
    expect(list.body).toHaveLength(1)
    const owner = await User.findById(testUserId).populate('notes')
    expect(owner.notes).toHaveLength(1)
    expect(owner.notes[0].content).toBe('Integration test note')
  })

  it('rejects empty content', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: '   ' })
      .expect(422)
    expect(res.body.error).toMatch(/non-empty/i)
  })

  it('rejects note without content', async () => {
    const initialCount = await getNotesCount(app)
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ important: true })
      .expect(422)
    expect(res.body.error).toMatch(/content must be a non-empty string/i)
    await expectNotesCount(app, initialCount)
  })

  it('enforces maxlength 500', async () => {
    const longText = 'a'.repeat(501)
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: longText })
      .expect(422)
    expect(res.body.error).toMatch(/exceeds 500/i)
  })

  it('prevents duplicate content', async () => {
    await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: 'dup' })
      .expect(201)
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: 'dup' })
      .expect(422)
    expect(res.body.error).toMatch(/duplicate/i)
  })

  it('updates importance flag', async () => {
    const created = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: 'flip', important: false })
    const id = created.body.id
    const updated = await request(app)
      .put(`/api/notes/${id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ important: true })
      .expect(200)
    expect(updated.body.important).toBe(true)
  })

  it('deletes a note', async () => {
    const created = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: 'to delete' })
    const id = created.body.id
    await request(app)
      .delete(`/api/notes/${id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204)
    await request(app).get(`/api/notes/${id}`).expect(404)
  })

  afterEach(async () => {
    await Note.deleteMany({})
    await User.updateMany({}, { $set: { notes: [] } })
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
    const user = await User.findById(testUserId)
    user.notes = []
    for (const data of initialNotes) {
      const note = await Note.create({ ...data, user: user._id })
      user.notes.push(note._id)
    }
    await user.save()
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

  it('adding a new note increases the count and includes the new note', async () => {
    await expectNotesCount(app, 2)

    const newNote = { content: 'New test note', important: true }
    await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newNote)
      .expect(201)

    await expectNotesCount(app, 3)
    await expectNotesToContain(app, 'New test note')
  })

  it('deleting a note decreases the count and removes the note from the database', async () => {
    const notesAtStart = await Note.find({})
    expect(notesAtStart).toHaveLength(2)
    const noteToDelete = notesAtStart[0]

    await request(app)
      .delete(`/api/notes/${noteToDelete.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204)

    const noteInDb = await Note.findById(noteToDelete.id)
    expect(noteInDb).toBeNull()

    const notesAtEnd = await Note.find({})
    expect(notesAtEnd).toHaveLength(notesAtStart.length - 1)
    const contents = notesAtEnd.map(n => n.content)
    expect(contents).not.toContain(noteToDelete.content)
  })
})