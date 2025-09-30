import app, { initDatabase } from './app.js'
import { PORT } from './utils/config.js'
import { info } from './utils/logger.js'

async function start() {
  await initDatabase()
  app.listen(PORT, () => info(`Server running on port ${PORT}`))
}

start()
