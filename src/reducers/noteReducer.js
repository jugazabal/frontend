const initialState = [
  {
    id: 1,
    content: 'If it hurts, do it more often',
    important: true
  },
  {
    id: 2,
    content: 'Adding manpower to a late software project makes it later!',
    important: false
  }
]

const createNoteObject = (content) => ({
  content,
  important: false,
  id: Number((Math.random() * 1000000).toFixed(0))
})

const noteReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'notes/createNote':
      return state.concat(createNoteObject(action.payload))
    case 'notes/toggleImportance':
      return state.map((note) =>
        note.id === action.payload ? { ...note, important: !note.important } : note
      )
    default:
      return state
  }
}

export const createNote = (content) => ({
  type: 'notes/createNote',
  payload: content
})

export const toggleImportanceOf = (id) => ({
  type: 'notes/toggleImportance',
  payload: id
})

export default noteReducer
