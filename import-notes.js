#!/usr/bin/env node
/*
 * Import existing file-based notes (data/notes.json or data/db.json) into MongoDB.
 *
 * Usage:
 *   MONGODB_URI="mongodb+srv://user:pass@cluster/db" node import-notes.js [--force]
 *
 * If the collection already has documents, import aborts unless --force is passed.
 * With --force existing notes are left untouched; duplicates (by identical content) are skipped.
 */
import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import process from 'process'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'
import { Note } from './models/note.js'
import { User } from './models/user.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const FORCE = process.argv.includes('--force')

async function resolveSourceFile() {
  const candidates = [
    path.join(__dirname, 'data', 'notes.json'),
    path.join(__dirname, 'data', 'db.json'),
    // Support root-level db.json (json-server style) containing { "notes": [...] }
    path.join(__dirname, 'db.json')
  ]
  for (const f of candidates) {
    try { await fs.access(f); return f } catch { /* continue */ }
  }
  return null
}

const IMPORT_USERNAME = process.env.IMPORT_USER_USERNAME || 'importer'
const IMPORT_PASSWORD = process.env.IMPORT_USER_PASSWORD || 'importerpass'
const IMPORT_NAME = process.env.IMPORT_USER_NAME || 'Import Script'

async function resolveImportUser() {
  let user = await User.findOne({ username: IMPORT_USERNAME })
  if (!user) {
    const passwordHash = await bcrypt.hash(IMPORT_PASSWORD, 10)
    user = await User.create({ username: IMPORT_USERNAME, name: IMPORT_NAME, passwordHash, notes: [] })
    console.log(`Created import user "${IMPORT_USERNAME}"`)
  }
  return user
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI not set. Aborting.')
    process.exit(1)
  }
  const src = await resolveSourceFile()
  if (!src) {
    console.error('No source file (data/notes.json or data/db.json) found.')
    process.exit(1)
  }
  console.log('Reading:', path.relative(process.cwd(), src))
  let data
  try { data = JSON.parse(await fs.readFile(src, 'utf8')) } catch (err) {
    console.error('Failed to parse source JSON:', err.message)
    process.exit(1)
  }
  // Allow either an array OR an object with a top-level "notes" array
  if (Array.isArray(data)) {
    // ok
  } else if (data && typeof data === 'object' && Array.isArray(data.notes)) {
    console.log('Found notes within root object at key "notes"')
    data = data.notes
  } else {
    console.error('Source JSON must be an array or an object with a notes[] array.')
    process.exit(1)
  }

  await mongoose.connect(uri)
  const user = await resolveImportUser()
  const existingCount = await Note.countDocuments({ user: user._id })
  if (existingCount && !FORCE) {
    console.error(`User ${user.username} already has ${existingCount} notes. Use --force to merge.`)
    process.exit(1)
  }

  const existingContents = new Set((await Note.find({ user: user._id }, 'content')).map(n => n.content))
  const toInsert = []
  for (const item of data) {
    if (!item || typeof item !== 'object') continue
    const content = (item.content || '').trim()
    if (!content || existingContents.has(content)) continue
    toInsert.push({ content, important: Boolean(item.important), user: user._id })
  }
  if (!toInsert.length) {
    console.log('Nothing new to import.')
  } else {
    const inserted = await Note.insertMany(toInsert)
    user.notes.push(...inserted.map(n => n._id))
    await user.save()
    console.log(`Imported ${inserted.length} notes.`)
  }
  await mongoose.connection.close()
}

main().catch(err => {
  console.error('Import failed:', err)
  process.exit(1)
})
