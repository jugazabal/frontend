import { graphqlRequest } from './graphqlClient'

const userSelection = `
  id
  username
  name
  notes {
    id
    content
    important
  }
`

const getAll = async () => {
  const data = await graphqlRequest(`
    query AllUsers {
      allUsers {
        ${userSelection}
      }
    }
  `)
  return data.allUsers
}

export default { getAll }