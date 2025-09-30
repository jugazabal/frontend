// ...existing code...
import { useState, useEffect } from 'react'
import notesService from './services/notes'
import Note from './components/Note'
import Notification from './components/Notification'



const App = () => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)

  const deleteNote = id => {
    if (window.confirm('Delete this note?')) {
      notesService
        .delete(id)
        .then(() => {
          setNotes(notes.filter(note => note.id !== id))
        })
    }
  }

  const toggleImportanceOf = id => {
    const note = notes.find(n => n.id === id)
    if (!note) return
    const changedNote = { ...note, important: !note.important }
    notesService
      .update(id, changedNote)
      .then(returnedNote => {
        setNotes(notes.map(n => n.id === id ? returnedNote : n))
      })
      .catch(err => {
        const baseMsg = `Failed to update '${note.content}'`
        if (err.message === 'note not found') {
          setErrorMessage(`The note '${note.content}' was already deleted from server`)
          setNotes(notes.filter(n => n.id !== id))
        } else {
          setErrorMessage(err.message ? `${baseMsg}: ${err.message}` : baseMsg)
        }
        setTimeout(() => setErrorMessage(null), 5000)
      })
  }

  useEffect(() => {
    notesService
      .getAll()
      .then(data => setNotes(data))
      .catch(err => {
        console.error(err)
        setErrorMessage('Failed to load notes. Check API configuration.')
        setTimeout(() => setErrorMessage(null), 5000)
      })
  }, [])

  const addNote = (event) => {
    event.preventDefault()
    const trimmed = newNote.trim()
    if (!trimmed) {
      setErrorMessage('Note content cannot be empty')
      setTimeout(() => setErrorMessage(null), 4000)
      return
    }
    if (trimmed.length > 500) {
      setErrorMessage('Note content exceeds 500 characters limit')
      setTimeout(() => setErrorMessage(null), 4000)
      return
    }
    const noteObject = {
      content: trimmed,
      important: Math.random() > 0.5
    }
    notesService
      .create(noteObject)
      .then(data => {
        setNotes(notes.concat(data))
        setNewNote('')
      })
      .catch(err => {
        setErrorMessage(err.message || 'Failed to create note')
        setTimeout(() => setErrorMessage(null), 5000)
      })
  }

  const handleNoteChange = (event) => {
    setNewNote(event.target.value)
  }

  const notesToShow = showAll ? notes : notes.filter((note) => note.important)

  return (
    <div className="app-container">
      <h1>Notes</h1>
      <Notification message={errorMessage} />
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all'}
        </button>
      </div>
      <ul>
        {notesToShow.map((note) => (
          <Note
            key={note.id}
            note={note}
            onToggle={() => toggleImportanceOf(note.id)}
            onDelete={() => deleteNote(note.id)}
          />
        ))}
      </ul>
      <form onSubmit={addNote}>
        <input value={newNote} onChange={handleNoteChange} />
        <button type="submit">save</button>
      </form>
    </div>
  )
}

export default App
