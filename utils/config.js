import process from 'process'

export const PORT = process.env.PORT || 3001
// Normalize Mongo URI: if user supplies a URI without an explicit database (ends with /? or just /),
// append the default database name 'noteApp'.
function normalizeMongoUri(raw) {
  if (!raw) return ''
  try {
    // Simple heuristic: if there's no path segment between host and query string, append noteApp
    // Examples considered missing db:
    //   mongodb+srv://user:pass@cluster0.mongodb.net
    //   mongodb+srv://user:pass@cluster0.mongodb.net/
    //   mongodb+srv://user:pass@cluster0.mongodb.net/?retryWrites=true
    const noProtocol = raw.replace(/^mongodb\+srv:\/\//, '')
    // Split off credentials/host vs path+query
    const firstSlash = noProtocol.indexOf('/')
    if (firstSlash === -1) {
      return raw + '/noteApp'
    }
    const after = noProtocol.slice(firstSlash + 1) // chars after first '/'
    // If empty or starts with '?' (query directly), treat as missing db
    if (after === '' || after.startsWith('?')) {
      // Insert noteApp before existing query (if any)
      if (after.startsWith('?')) {
        return raw.replace('/?', '/noteApp?')
      }
      return raw + 'noteApp'
    }
    return raw
  } catch {
    return raw
  }
}

export const MONGODB_URI = normalizeMongoUri(process.env.MONGODB_URI || '')
export const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)
export const GITHUB_PAGES_ORIGIN = 'https://jugazabal.github.io'
