import axios from 'axios'
// Use relative URL so Vite proxy (in dev) or same-origin (in prod) handles routing.
// Allow override via environment variable VITE_API_BASE if needed.
const apiBase = import.meta.env.VITE_API_BASE || ''
const baseUrl = `${apiBase}/api/blogs`

let token = null

const setToken = newToken => {
  token = newToken ? `Bearer ${newToken}` : null
}

const authConfig = () => (token ? { headers: { Authorization: token } } : {})

const deleteBlog = id => {
  return axios.delete(`${baseUrl}/${id}`, authConfig())
}


const getAll = () => {
  return axios.get(baseUrl)
    .then(response => {
      const data = response.data
      if (!Array.isArray(data)) {
        throw new Error('Unexpected response format (expected an array of blogs)')
      }
      return data
    })
}

const create = newObject => {
  return axios.post(baseUrl, newObject, authConfig()).then(response => response.data)
}

const update = (id, newObject) => {
  return axios.put(`${baseUrl}/${id}`, newObject, authConfig()).then(response => response.data)
}

const createComment = (id, comment) => {
  return axios.post(`${baseUrl}/${id}/comments`, { comment }, authConfig()).then(response => response.data)
}

export default { 
  getAll,
  create,
  update,
  delete: deleteBlog,
  createComment,
  setToken
}
