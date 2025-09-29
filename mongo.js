#!/usr/bin/env node
/*
 * Practice script for interacting with MongoDB using Mongoose.
 *
 * SECURITY NOTE: Do NOT hard‑code real credentials in version control.
 * Instead, set MONGODB_URI in an .env file (which should be in .gitignore) or
 * pass it on the command line:
 *   MONGODB_URI="mongodb+srv://<user>:<pass>@cluster0.example.mongodb.net/notes?retryWrites=true&w=majority" \
 *     node mongo.js "A sample note" --important
 *
 * This script supports two modes:
 *   1. List all notes:  node mongo.js
 *   2. Add a note:      node mongo.js "Note content" [--important]
 */

import mongoose from 'mongoose'
import process from 'process'

// If user explicitly wants to practice with the provided connection string,
// you can place it in MONGODB_URI. (Avoid committing secrets!)
// Added explicit database name `noteApp` so we don't use the default `test` DB.
// NOTE: Credentials are still embedded here only for practice; remove before any public commit.
const FALLBACK_URI = 'mongodb+srv://jugazabal_db_user:APKizFjSVBIuRnT4@cluster0.p5hzmuf.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0'

const mongoUri = process.env.MONGODB_URI || FALLBACK_URI

if (!mongoUri) {
  console.error('Missing MongoDB connection string. Set MONGODB_URI env variable.')
  process.exit(1)
}

// Parse CLI args (skip node + script path)
const args = process.argv.slice(2)

mongoose.set('strictQuery', false)

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  important: { type: Boolean, default: false }
})

const Note = mongoose.model('Note', noteSchema)

async function listNotes() {
  const notes = await Note.find({})
  if (!notes.length) {
    console.log('(no notes)')
  } else {
    console.log('notes:')
    notes.forEach(n => console.log(`- ${n.content} ${n.important ? '(important)' : ''}`))
  }
}

async function addNote(content, isImportant) {
  const note = new Note({ content, important: isImportant })
  await note.save()
  console.log('note saved!')
}

async function main() {
  try {
    await mongoose.connect(mongoUri)

    if (args.length === 0) {
      await listNotes()
    } else {
      const content = args[0]
      const important = args.includes('--important')
      if (!content) {
        console.error('Provide note content or run with no args to list notes.')
        process.exitCode = 1
      } else {
        await addNote(content, important)
      }
    }
  } catch (err) {
    console.error('Mongo script error:', err)
    process.exitCode = 1
  } finally {
    await mongoose.connection.close()
  }
}

main()
