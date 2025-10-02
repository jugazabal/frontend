import axios from 'axios'

const apiBase = import.meta.env.VITE_API_BASE || ''
const baseUrl = `${apiBase}/api/login`

const login = async credentials => {
  const response = await axios.post(baseUrl, credentials)
  return response.data
}

export default { login }
