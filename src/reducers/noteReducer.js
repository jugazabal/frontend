import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = [
  {
    id: '1',
    content: 'If it hurts, do it more often',
    important: true
  },
  {
    id: '2',
    content: 'Adding manpower to a late software project makes it later!',
    important: false
  }
]

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    createNote: {
      reducer(state, action) {
        state.push(action.payload)
      },
      prepare(content) {
        return {
          payload: {
            id: nanoid(),
            content,
            important: false
          }
        }
      }
    },
    toggleImportance(state, action) {
      const note = state.find((n) => n.id === action.payload)
      if (note) {
        note.important = !note.important
      }
    }
  }
})

export const { createNote, toggleImportance } = noteSlice.actions

export default noteSlice.reducer
