import { graphqlRequest } from './graphqlClient'

const login = async ({ username, password }) => {
  const data = await graphqlRequest(`
    mutation Login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
        token
        user {
          id
          username
          name
        }
      }
    }
  `, { username, password })

  const { token, user } = data.login

  return {
    token,
    username: user.username,
    name: user.name,
    id: user.id
  }
}

export default { login }
