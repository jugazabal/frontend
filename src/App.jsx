// ...existing code...
import { useEffect, useRef, useState, useMemo } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import blogsService from './services/blogs'
import Navigation from './components/Navigation'
import Home from './components/Home'
import Blogs from './components/Blogs'
import Users from './components/Users'
import User from './components/User'
import BlogDetail from './components/BlogDetail'
import Login from './components/Login'
import Notification from './components/Notification'
import Footer from './components/Footer'
import { setUser, clearUser } from './reducers/userReducer'
import { setNotification } from './reducers/notificationReducer'

const LOCAL_STORAGE_KEY = 'loggedBlogAppUser'
const THEME_STORAGE_KEY = 'blogAppTheme'

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'light'
  }
  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
}

const App = () => {
  const dispatch = useDispatch()
  const user = useSelector(state => state.user)
  const notification = useSelector(state => state.notification)
  const notificationTimeout = useRef(null)
  const [themeMode, setThemeMode] = useState(getInitialTheme)

  const muiTheme = useMemo(() => createTheme({
    palette: { mode: themeMode }
  }), [themeMode])

  const styledTheme = useMemo(() => (
    themeMode === 'dark'
      ? {
          surface: '#111c30',
          border: 'rgba(148, 163, 184, 0.35)',
          textPrimary: '#e2e8f0',
          heading: '#f8fafc',
          muted: '#cbd5f5',
          footerText: '#cbd5f5',
          cardShadow: '0 22px 40px rgba(8, 17, 45, 0.45)'
        }
      : {
          surface: '#ffffff',
          border: '#d9e0f2',
          textPrimary: '#1f2937',
          heading: '#0f172a',
          muted: '#475569',
          footerText: '#334155',
          cardShadow: '0 18px 38px rgba(15, 23, 42, 0.08)'
        }
  ), [themeMode])

  const notify = (message, duration = 5000) => {
    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current)
      notificationTimeout.current = null
    }
    dispatch(setNotification(message))
    if (message) {
      notificationTimeout.current = setTimeout(() => {
        dispatch(setNotification(null))
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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode)
    document.body.dataset.bsTheme = themeMode
    document.body.dataset.theme = themeMode
  }, [themeMode])

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

  const handleThemeToggle = () => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <MuiThemeProvider theme={muiTheme}>
      <StyledThemeProvider theme={styledTheme}>
        <CssBaseline />
        <div className="app-shell">
          <Navigation
            user={user}
            handleLogout={handleLogout}
            themeMode={themeMode}
            onToggleTheme={handleThemeToggle}
          />
          <Notification message={notification} />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blogs" element={<Blogs user={user} notify={notify} handleAuthError={handleAuthError} />} />
              <Route path="/users" element={<Users />} />
              <Route path="/users/:id" element={<User />} />
              <Route path="/blogs/:id" element={<BlogDetail />} />
              <Route path="/login" element={<Login setUser={(user) => dispatch(setUser(user))} notify={notify} />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </StyledThemeProvider>
    </MuiThemeProvider>
  )
}

export default App
