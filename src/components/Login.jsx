import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import loginService from '../services/login'
import blogsService from '../services/blogs'

const Login = ({ setUser, notify }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const credentials = { username: username.trim(), password }
      const loggedUser = await loginService.login(credentials)
      setUser(loggedUser)
      blogsService.setToken(loggedUser.token)
      window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(loggedUser))
      setUsername('')
      setPassword('')
      notify(`Logged in as ${loggedUser.name || loggedUser.username}`, 3000)
      navigate('/')
    } catch (err) {
      notify(err.response?.data?.error || 'Invalid username or password')
    }
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 420 }}>
      <Stack spacing={3}>
        <div>
          <Typography variant="h4" component="h2" gutterBottom>
            Login
          </Typography>
          <Alert severity="info">Use your blog credentials to sign in.</Alert>
        </div>
        <form onSubmit={handleLogin}>
          <Stack spacing={2}>
            <TextField
              label="Username"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
              autoComplete="username"
              fullWidth
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              autoComplete="current-password"
              fullWidth
              required
            />
            <Button type="submit" variant="contained" size="large">
              Login
            </Button>
          </Stack>
        </form>
      </Stack>
    </Paper>
  )
}

export default Login