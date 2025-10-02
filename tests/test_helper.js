import request from 'supertest'
import { expect } from 'vitest'

export const getNotesCount = async (app) => {
  const response = await request(app).get('/api/notes')
  return response.body.length
}

export const notesContain = async (app, content) => {
  const response = await request(app).get('/api/notes')
  const contents = response.body.map(e => e.content)
  return contents.includes(content)
}

export const expectNotesCount = async (app, expectedCount) => {
  const count = await getNotesCount(app)
  expect(count).toBe(expectedCount)
}

export const expectNotesToContain = async (app, content) => {
  const contains = await notesContain(app, content)
  expect(contains).toBe(true)
}