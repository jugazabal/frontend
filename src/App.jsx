// ...existing code...
import { useEffect, useRef, useState, useMemo } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
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

  const styledTheme = useMemo(() => {
    if (themeMode === 'dark') {
      return {
        heroBackground: 'linear-gradient(135deg, #1f2937 0%, #0f172a 100%)',
        heroText: '#e2e8f0',
        heroBorder: 'rgba(148, 163, 184, 0.2)',
        heroShadow: '0 24px 40px rgba(2, 6, 23, 0.6)',
        cardBg: 'rgba(30, 41, 59, 0.85)',
        cardBorder: 'rgba(148, 163, 184, 0.2)',
        cardShadow: '0 18px 32px rgba(2, 6, 23, 0.7)',
        primaryText: '#e2e8f0',
        accent: '#93c5fd',
        counterText: '#f8fafc',
        success: '#4ade80',
        danger: '#f472b6',
        neutral: '#94a3b8',
        buttonText: '#0b1120',
        hoverShadow: '0 14px 36px rgba(15, 23, 42, 0.55)'
      }
    }
    return {
      heroBackground: 'linear-gradient(135deg, #0d6efd 0%, #6f42c1 100%)',
      heroText: '#ffffff',
      heroBorder: 'rgba(13, 110, 253, 0.25)',
      heroShadow: '0 24px 36px rgba(13, 110, 253, 0.35)',
      cardBg: '#ffffff',
      cardBorder: 'rgba(13, 110, 253, 0.15)',
      cardShadow: '0 16px 28px rgba(15, 23, 42, 0.08)',
      primaryText: '#111827',
      accent: '#0d6efd',
      counterText: '#111827',
      success: '#198754',
      danger: '#d63384',
      neutral: '#6c757d',
      buttonText: '#ffffff',
      hoverShadow: '0 14px 28px rgba(17, 24, 39, 0.18)'
    }
  }, [themeMode])

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
    document.body.style.backgroundColor = themeMode === 'dark' ? '#0f172a' : '#f8f9fa'
    document.body.style.color = themeMode === 'dark' ? '#e2e8f0' : ''
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
        <div className={`container py-4 ${themeMode === 'dark' ? 'text-light' : ''}`}>
          <Container maxWidth="lg">
            <Navigation
              user={user}
              handleLogout={handleLogout}
              themeMode={themeMode}
              onToggleTheme={handleThemeToggle}
            />
            <Notification message={notification} />
            <Box component="main" sx={{ mt: 3 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blogs" element={<Blogs user={user} notify={notify} handleAuthError={handleAuthError} />} />
                <Route path="/users" element={<Users />} />
                <Route path="/users/:id" element={<User />} />
                <Route path="/blogs/:id" element={<BlogDetail />} />
                <Route path="/login" element={<Login setUser={(user) => dispatch(setUser(user))} notify={notify} />} />
              </Routes>
            </Box>
          </Container>
        </div>
      </StyledThemeProvider>
    </MuiThemeProvider>
  )
}

export default App
