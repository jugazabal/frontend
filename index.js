import app, { initDatabase } from './app.js'
import { initGraphQL } from './graphql/server.js'
import { PORT } from './utils/config.js'
import { info } from './utils/logger.js'
import { unknownEndpoint, errorHandler } from './utils/middleware.js'

async function start() {
  console.log('Starting server...')
  await initDatabase()
  await initGraphQL(app)
  app.use(unknownEndpoint)
  app.use(errorHandler)
  console.log('Database initialized, starting listen...')
  app.listen(PORT, () => info(`Server running on port ${PORT}`))
  console.log('Listen called')
  // Keep the event loop alive
  setInterval(() => {}, 1000)
}

start()
