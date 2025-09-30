import process from 'process'

export const PORT = process.env.PORT || 3001
export const MONGODB_URI = process.env.MONGODB_URI || ''
export const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)
export const GITHUB_PAGES_ORIGIN = 'https://jugazabal.github.io'
