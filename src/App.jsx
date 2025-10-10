// ...existing code...
import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import notesService from './services/notes'
import loginService from './services/login'
import Note from './components/Note'
import Notification from './components/Notification'

const LOCAL_STORAGE_KEY = 'loggedNoteAppUser'

const App = () => {
  const [newNote, setNewNote] = useState('')
  const [filter, setFilter] = useState('all')
  const [errorMessage, setErrorMessage] = useState(null)
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const notificationTimeout = useRef(null)
  const queryClient = useQueryClient()

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
    if (!user) {
      notesService.setToken(null)
      if (filter === 'mine') {
        setFilter('all')
      }
    }
  }, [user, filter])

  const {
    data: notes = [],
    isLoading: notesLoading,
    isError: notesError,
    error: notesErrorObj
  } = useQuery({
    queryKey: ['notes'],
    queryFn: notesService.getAll,
    retry: false
  })

  const appendNoteToCache = (createdNote) => {
    queryClient.setQueryData(['notes'], (old = []) => old.concat(createdNote))
  }

  const replaceNoteInCache = (updatedNote) => {
    queryClient.setQueryData(['notes'], (old = []) =>
      old.map(n => (n.id === updatedNote.id ? updatedNote : n))
    )
  }

  const removeNoteFromCache = (id) => {
    queryClient.setQueryData(['notes'], (old = []) =>
      old.filter(n => n.id !== id)
    )
  }

  useEffect(() => {
    if (notesError) {
      console.error(notesErrorObj)
      notify('Failed to load notes. Check API configuration.')
    }
  }, [notesError, notesErrorObj])

  const createNoteMutation = useMutation({
    mutationFn: notesService.create,
    onSuccess: (createdNote) => {
      appendNoteToCache(createdNote)
    },
    onError: (err) => {
      if (!handleAuthError(err)) {
        notify(err.response?.data?.error || 'Failed to create note')
      }
    }
  })

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }) => notesService.update(id, data),
    onSuccess: (updatedNote) => {
      replaceNoteInCache(updatedNote)
    },
    onError: (err, variables) => {
      if (handleAuthError(err)) return
      if (err?.response?.status === 404 && variables?.originalNote) {
        notify(`The note '${variables.originalNote.content}' was already deleted from server`, 4000)
        removeNoteFromCache(variables.originalNote.id)
      } else {
        notify(err?.response?.data?.error || `Failed to update note`)
      }
    }
  })

  const deleteNoteMutation = useMutation({
    mutationFn: ({ id }) => notesService.delete(id),
    onSuccess: (_, variables) => {
      removeNoteFromCache(variables.id)
    },
    onError: (err, variables) => {
      if (handleAuthError(err)) return
      if (err?.response?.status === 404) {
        notify('Note was already removed from server.', 3000)
        removeNoteFromCache(variables?.id)
      } else {
        notify(err?.response?.data?.error || 'Failed to delete note')
      }
    }
  })

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
      deleteNoteMutation.mutate({ id })
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
    updateNoteMutation.mutate({ id, data: changedNote, originalNote: note })
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
    createNoteMutation.mutate(noteObject, {
      onSuccess: () => {
        setNewNote('')
      }
    })
  }

  const handleNoteChange = (event) => {
    setNewNote(event.target.value)
  }

  const notesToShow = notes.filter((note) => {
    if (filter === 'important') {
      return note.important
    }
    if (filter === 'mine') {
      return isOwner(note)
    }
    return true
  })

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

      <fieldset style={{ marginTop: '1rem' }}>
        <legend>Filter notes</legend>
        <label style={{ marginRight: '1rem' }}>
          <input
            type="radio"
            name="note-filter"
            value="all"
            checked={filter === 'all'}
            onChange={() => setFilter('all')}
          />
          <span style={{ marginLeft: '0.3rem' }}>All</span>
        </label>
        <label style={{ marginRight: '1rem' }}>
          <input
            type="radio"
            name="note-filter"
            value="important"
            checked={filter === 'important'}
            onChange={() => setFilter('important')}
          />
          <span style={{ marginLeft: '0.3rem' }}>Important only</span>
        </label>
        <label>
          <input
            type="radio"
            name="note-filter"
            value="mine"
            checked={filter === 'mine'}
            onChange={() => setFilter('mine')}
            disabled={!user}
          />
          <span style={{ marginLeft: '0.3rem' }}>{user ? 'Created by me' : 'Created by me (login required)'}</span>
        </label>
      </fieldset>
      {notesLoading && <p>Loading notes...</p>}
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
