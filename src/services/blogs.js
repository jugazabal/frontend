import graphqlClient, { graphqlRequest } from './graphqlClient'

const noteSelection = `
  id
  content
  important
  createdAt
  updatedAt
  comments
  user {
    id
    username
    name
  }
`

const setToken = (newToken) => {
  graphqlClient.setAuthToken(newToken)
}

const getAll = async () => {
  const data = await graphqlRequest(`
    query AllNotes {
      allNotes {
        ${noteSelection}
      }
    }
  `)
  return data.allNotes
}

const create = async ({ content, important }) => {
  const data = await graphqlRequest(`
    mutation AddNote($content: String!, $important: Boolean) {
      addNote(content: $content, important: $important) {
        ${noteSelection}
      }
    }
  `, { content, important })
  return data.addNote
}

const update = async (id, updates) => {
  void updates
  const data = await graphqlRequest(`
    mutation ToggleImportance($id: ID!) {
      toggleImportance(id: $id) {
        ${noteSelection}
      }
    }
  `, { id })
  return data.toggleImportance
}

const deleteBlog = async (id) => {
  const data = await graphqlRequest(`
    mutation DeleteNote($id: ID!) {
      deleteNote(id: $id)
    }
  `, { id })
  if (!data.deleteNote) {
    throw new Error('Failed to delete note')
  }
  return true
}

const createComment = async (id, comment) => {
  const data = await graphqlRequest(`
    mutation AddComment($id: ID!, $comment: String!) {
      addComment(id: $id, comment: $comment) {
        ${noteSelection}
      }
    }
  `, { id, comment })
  return data.addComment
}

export default {
  getAll,
  create,
  update,
  delete: deleteBlog,
  createComment,
  setToken
}
