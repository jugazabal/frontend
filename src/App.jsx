// ...existing code...
import { useState, useEffect, useRef } from 'react'
import notesService from './services/notes'
import loginService from './services/login'
import Note from './components/Note'
import Notification from './components/Notification'

const LOCAL_STORAGE_KEY = 'loggedNoteAppUser'

const App = () => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const notificationTimeout = useRef(null)

  const notify = (message, duration = 5000) => {
    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current)
      notificationTimeout.current = null
    }
    setErrorMessage(message)
    if (message) {
      notificationTimeout.current = setTimeout(() => {
        setErrorMessage(null)
        notificationTimeout.current = null
      }, duration)
    }
  }

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
        if (parsed.token) {
          notesService.setToken(parsed.token)
        }
      } catch (err) {
        console.warn('Failed to parse stored user, clearing it', err)
        window.localStorage.removeItem(LOCAL_STORAGE_KEY)
      }
    }
    return () => {
      if (notificationTimeout.current) {
        clearTimeout(notificationTimeout.current)
      }
    }
  }, [])

  useEffect(() => {
    notesService
      .getAll()
      .then(data => setNotes(data))
      .catch(err => {
        console.error(err)
        notify('Failed to load notes. Check API configuration.')
      })
  }, [])

  useEffect(() => {
    if (!user) {
      notesService.setToken(null)
    }
  }, [user])

  const handleLogout = () => {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY)
    setUser(null)
    notesService.setToken(null)
  }

  const handleAuthError = (err) => {
    const status = err?.response?.status
    if (status === 401) {
      notify('Session expired. Please log in again.')
      handleLogout()
      return true
    }
    if (status === 403) {
      notify('You can only modify your own notes.')
      return true
    }
    return false
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const credentials = { username: username.trim(), password }
      const loggedUser = await loginService.login(credentials)
      setUser(loggedUser)
      notesService.setToken(loggedUser.token)
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loggedUser))
      setUsername('')
      setPassword('')
      notify(`Logged in as ${loggedUser.name || loggedUser.username}`, 3000)
    } catch (err) {
      notify(err.response?.data?.error || 'Invalid username or password')
    }
  }

  const isOwner = (note) => {
    const ownerId = typeof note.user === 'object' && note.user !== null
      ? note.user.id
      : note.user
    return Boolean(user && ownerId && user.id === ownerId)
  }

  const deleteNote = id => {
    const note = notes.find(n => n.id === id)
    if (!note) return
    if (!user) {
      notify('Login to delete notes.')
      return
    }
    if (!isOwner(note)) {
      notify('You can only delete your own notes.')
      return
    }
    if (window.confirm('Delete this note?')) {
      notesService
        .delete(id)
        .then(() => {
          setNotes(notes.filter(n => n.id !== id))
        })
        .catch(err => {
          if (handleAuthError(err)) return
          if (err.response?.status === 404) {
            notify('Note was already removed from server.', 3000)
            setNotes(notes.filter(n => n.id !== id))
          } else {
            notify(err.response?.data?.error || 'Failed to delete note')
          }
        })
    }
  }

  const toggleImportanceOf = id => {
    const note = notes.find(n => n.id === id)
    if (!note) return
    if (!user) {
      notify('Login to update notes.')
      return
    }
    if (!isOwner(note)) {
      notify('You can only update your own notes.')
      return
    }
    const changedNote = { important: !note.important }
    notesService
      .update(id, changedNote)
      .then(returnedNote => {
        setNotes(notes.map(n => n.id === id ? returnedNote : n))
      })
      .catch(err => {
        if (handleAuthError(err)) return
        if (err.response?.status === 404) {
          notify(`The note '${note.content}' was already deleted from server`, 4000)
          setNotes(notes.filter(n => n.id !== id))
        } else {
          notify(err.response?.data?.error || `Failed to update '${note.content}'`)
        }
      })
  }

  const addNote = (event) => {
    event.preventDefault()
    if (!user) {
      notify('Login to add notes.', 4000)
      return
    }
    const trimmed = newNote.trim()
    if (!trimmed) {
      notify('Note content cannot be empty', 4000)
      return
    }
    if (trimmed.length > 500) {
      notify('Note content exceeds 500 characters limit', 4000)
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
        if (handleAuthError(err)) return
        notify(err.response?.data?.error || 'Failed to create note')
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

      {user ? (
        <div className="user-info">
          <span>{user.name || user.username} logged in</span>
          <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>logout</button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="login-form">
          <div>
            username{' '}
            <input
              value={username}
              onChange={({ target }) => setUsername(target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            password{' '}
            <input
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              autoComplete="current-password"
            />
          </div>
          <button type="submit">login</button>
        </form>
      )}

      <div style={{ marginTop: '1rem' }}>
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
            canModify={isOwner(note)}
          />
        ))}
      </ul>
      {user ? (
        <form onSubmit={addNote}>
          <input value={newNote} onChange={handleNoteChange} />
          <button type="submit">save</button>
        </form>
      ) : (
        <p>Log in to add new notes.</p>
      )}
    </div>
  )
}

export default App
