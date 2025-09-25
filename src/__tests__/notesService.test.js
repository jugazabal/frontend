import { describe, it, expect, vi } from 'vitest'
import notesService from '../services/notes'
import axios from 'axios'

vi.mock('axios')

describe('notesService', () => {
  it('builds base URL correctly (relative)', () => {
    // internal detail: create calls axios.post with baseUrl
    axios.post.mockResolvedValue({ data: { id: '99', content: 'x', important: false } })
    return notesService.create({ content: 'x' }).then(() => {
      expect(axios.post.mock.calls[0][0]).toBe('/api/notes')
    })
  })
})
