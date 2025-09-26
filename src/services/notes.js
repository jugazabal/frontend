import axios from 'axios'
// Use relative URL so Vite proxy (in dev) or same-origin (in prod) handles routing.
// Allow override via environment variable VITE_API_BASE if needed.
const apiBase = import.meta.env.VITE_API_BASE || ''
const baseUrl = `${apiBase}/api/notes`

const deleteNote = id => {
  return axios.delete(`${baseUrl}/${id}`)
}


const getAll = () => {
  return axios.get(baseUrl)
    .then(response => {
      const data = response.data
      if (!Array.isArray(data)) {
        throw new Error('Unexpected response format (expected an array of notes)')
      }
      return data
    })
}

const create = newObject => {
  const request = axios.post(baseUrl, newObject)
  return request.then(response => response.data)
}

const update = (id, newObject) => {
  const request = axios.put(`${baseUrl}/${id}`, newObject)
  return request.then(response => response.data)
}

export default { 
  getAll: getAll, 
  create: create, 
  update: update,
  delete: deleteNote
}
