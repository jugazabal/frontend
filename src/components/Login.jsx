import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
    </div>
  )
}

export default Login