import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import notesService from '../services/notes'

const NOTES_QUERY_KEY = ['notes']

const useNotesData = ({ notify, handleAuthError }) => {
  const queryClient = useQueryClient()

  const notesQuery = useQuery({
    queryKey: NOTES_QUERY_KEY,
    queryFn: notesService.getAll,
    retry: false
  })

  const appendNoteToCache = (createdNote) => {
    queryClient.setQueryData(NOTES_QUERY_KEY, (old = []) => old.concat(createdNote))
  }

  const replaceNoteInCache = (updatedNote) => {
    queryClient.setQueryData(NOTES_QUERY_KEY, (old = []) =>
      old.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    )
  }

  const removeNoteFromCache = (id) => {
    queryClient.setQueryData(NOTES_QUERY_KEY, (old = []) => old.filter((note) => note.id !== id))
  }

  const createNoteMutation = useMutation({
    mutationFn: notesService.create,
    onSuccess: (createdNote) => {
      appendNoteToCache(createdNote)
    },
    onError: (err) => {
      if (!handleAuthError?.(err)) {
        notify?.(err?.response?.data?.error || 'Failed to create note')
      }
    }
  })

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }) => notesService.update(id, data),
    onSuccess: (updatedNote) => {
      replaceNoteInCache(updatedNote)
    },
    onError: (err, variables) => {
      if (handleAuthError?.(err)) return
      if (err?.response?.status === 404 && variables?.note) {
        notify?.(`The note '${variables.note.content}' was already deleted from server`)
        removeNoteFromCache(variables.note.id)
      } else {
        notify?.(err?.response?.data?.error || 'Failed to update note')
      }
    }
  })

  const deleteNoteMutation = useMutation({
    mutationFn: ({ id }) => notesService.delete(id),
    onSuccess: (_, variables) => {
      if (variables?.id) {
        removeNoteFromCache(variables.id)
      }
    },
    onError: (err, variables) => {
      if (handleAuthError?.(err)) return
      if (err?.response?.status === 404) {
        notify?.('Note was already removed from server.')
        if (variables?.id) {
          removeNoteFromCache(variables.id)
        }
      } else {
        notify?.(err?.response?.data?.error || 'Failed to delete note')
      }
    }
  })

  return {
    notes: notesQuery.data ?? [],
    isLoading: notesQuery.isLoading,
    isError: notesQuery.isError,
    error: notesQuery.error,
    createNote: createNoteMutation.mutate,
    updateNote: updateNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutate
  }
}

export default useNotesData
