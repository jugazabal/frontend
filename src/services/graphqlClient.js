const apiBase = import.meta.env.VITE_API_BASE || ''
const endpoint = `${apiBase}/graphql`

let authToken = null

export const setAuthToken = (token) => {
  authToken = token ? `Bearer ${token}` : null
}

class GraphQLRequestError extends Error {
  constructor(message, response, graphQLErrors) {
    super(message)
    this.name = 'GraphQLRequestError'
    this.response = response
    this.graphQLErrors = graphQLErrors
  }
}

export const graphqlRequest = async (query, variables = {}) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: authToken } : {})
    },
    body: JSON.stringify({ query, variables })
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new GraphQLRequestError('GraphQL request failed', response, result?.errors)
  }

  if (result?.errors?.length) {
    const message = result.errors.map(err => err.message).join(', ')
    throw new GraphQLRequestError(message, response, result.errors)
  }

  return result.data
}

export default {
  request: graphqlRequest,
  setAuthToken
}
