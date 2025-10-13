// ...existing code...
import { useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import blogsService from './services/blogs'
import Navigation from './components/Navigation'
import Home from './components/Home'
import Blogs from './components/Blogs'
import Users from './components/Users'
import User from './components/User'
import BlogDetail from './components/BlogDetail'
import Login from './components/Login'
import Notification from './components/Notification'
import { setUser, clearUser } from './reducers/userReducer'
import { setNotification, clearNotification } from './reducers/notificationReducer'

const LOCAL_STORAGE_KEY = 'loggedBlogAppUser'

const App = () => {
  const dispatch = useDispatch()
  const user = useSelector(state => state.user)
  const notification = useSelector(state => state.notification)
  const notificationTimeout = useRef(null)

  const notify = (message, duration = 5000) => {
    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current)
      notificationTimeout.current = null
    }
    dispatch(setNotification(message))
    if (message) {
      notificationTimeout.current = setTimeout(() => {
        dispatch(clearNotification())
        notificationTimeout.current = null
      }, duration)
    }
  }

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        dispatch(setUser(parsed))
        if (parsed.token) {
          blogsService.setToken(parsed.token)
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
  }, [dispatch])

  useEffect(() => {
    if (!user) {
      blogsService.setToken(null)
    }
  }, [user])

  const handleLogout = () => {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY)
    dispatch(clearUser())
    blogsService.setToken(null)
  }

  const handleAuthError = (err) => {
    const status = err?.response?.status
    if (status === 401) {
      notify('Session expired. Please log in again.')
      handleLogout()
      return true
    }
    if (status === 403) {
      notify('You can only modify your own blogs.')
      return true
    }
    return false
  }

  return (
    <div className="app-container">
      <Navigation user={user} handleLogout={handleLogout} />
      <Notification message={notification} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blogs" element={<Blogs user={user} notify={notify} handleAuthError={handleAuthError} />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<User />} />
        <Route path="/blogs/:id" element={<BlogDetail />} />
        <Route path="/login" element={<Login setUser={(user) => dispatch(setUser(user))} notify={notify} />} />
      </Routes>
    </div>
  )
}

export default App
