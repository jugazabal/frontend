import axios from 'axios'
const apiBase = import.meta.env.VITE_API_BASE || ''
const baseUrl = `${apiBase}/api/users`

const getAll = () => {
  return axios.get(baseUrl).then(response => response.data)
}

export default { getAll }