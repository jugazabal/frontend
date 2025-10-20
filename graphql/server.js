import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { typeDefs } from './typeDefs.js'
import { resolvers } from './resolvers.js'
import { buildContext } from './context.js'

let apolloServer

export const initGraphQL = async (app) => {
  if (apolloServer) {
    return apolloServer
  }

  apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded'
  })

  await apolloServer.start()

  app.use('/graphql', expressMiddleware(apolloServer, {
    context: buildContext
  }))

  return apolloServer
}
