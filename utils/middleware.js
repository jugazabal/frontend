import cors from 'cors'
import morgan from 'morgan'
import express from 'express'
import path from 'path'
import { GITHUB_PAGES_ORIGIN, ALLOWED_ORIGINS } from './config.js'
import { warn } from './logger.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
export const distPath = path.join(__dirname, '..', 'dist')

const allowList = ALLOWED_ORIGINS.length
  ? Array.from(new Set([...ALLOWED_ORIGINS, GITHUB_PAGES_ORIGIN]))
  : []

export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (!allowList.length) return callback(null, true)
    if (allowList.includes(origin)) return callback(null, true)
    warn(`Blocked CORS origin: ${origin}`)
    return callback(new Error('Not allowed by CORS'))
  }
}

// Morgan config
morgan.token('body', (req) => JSON.stringify(req.body))
export const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms :body')

export const unknownEndpoint = (_req, res) => {
  res.status(404).json({ error: 'unknown endpoint' })
}

// eslint-disable-next-line no-unused-vars
export const errorHandler = (error, _req, res, _next) => {
  console.error(error.name, error.message)
  if (error.name === 'CastError') return res.status(400).json({ error: 'malformatted id' })
  if (error.name === 'ValidationError') return res.status(422).json({ error: error.message })
  if (error.code === 11000) return res.status(422).json({ error: 'duplicate note content' })
  res.status(500).json({ error: 'internal server error' })
}

export const commonMiddleware = [
  cors(corsOptions),
  express.json(),
  requestLogger,
  express.static(distPath)
]
