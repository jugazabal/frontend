export const typeDefs = `#graphql
  type Note {
    id: ID!
    content: String!
    important: Boolean!
    createdAt: String
    updatedAt: String
    user: User
    comments: [String!]!
  }

  type User {
    id: ID!
    username: String!
    name: String
    notes: [Note!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    noteCount: Int!
    allNotes(important: Boolean): [Note!]!
    findNote(id: ID!): Note
    allUsers: [User!]!
    me: User
  }

  type Mutation {
    addNote(content: String!, important: Boolean = false): Note!
    toggleImportance(id: ID!): Note!
    deleteNote(id: ID!): Boolean!
    createUser(username: String!, name: String, password: String!): User!
    addComment(id: ID!, comment: String!): Note!
    login(username: String!, password: String!): AuthPayload!
  }
`
