import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import blogsService from '../services/blogs'

const BLOGS_QUERY_KEY = ['blogs']

const useBlogsData = ({ notify, handleAuthError }) => {
  const queryClient = useQueryClient()

  const blogsQuery = useQuery({
    queryKey: BLOGS_QUERY_KEY,
    queryFn: blogsService.getAll,
    retry: false
  })

  const appendBlogToCache = (createdBlog) => {
    queryClient.setQueryData(BLOGS_QUERY_KEY, (old = []) => old.concat(createdBlog))
  }

  const replaceBlogInCache = (updatedBlog) => {
    queryClient.setQueryData(BLOGS_QUERY_KEY, (old = []) =>
      old.map((blog) => (blog.id === updatedBlog.id ? updatedBlog : blog))
    )
  }

  const removeBlogFromCache = (id) => {
    queryClient.setQueryData(BLOGS_QUERY_KEY, (old = []) => old.filter((blog) => blog.id !== id))
  }

  const createBlogMutation = useMutation({
    mutationFn: blogsService.create,
    onSuccess: (createdBlog) => {
      appendBlogToCache(createdBlog)
    },
    onError: (err) => {
      if (!handleAuthError?.(err)) {
        notify?.(err?.response?.data?.error || 'Failed to create blog')
      }
    }
  })

  const updateBlogMutation = useMutation({
    mutationFn: ({ id, data }) => blogsService.update(id, data),
    onSuccess: (updatedBlog) => {
      replaceBlogInCache(updatedBlog)
    },
    onError: (err, variables) => {
      if (handleAuthError?.(err)) return
      if (err?.response?.status === 404 && variables?.blog) {
        notify?.(`The blog '${variables.blog.content}' was already deleted from server`)
        removeBlogFromCache(variables.blog.id)
      } else {
        notify?.(err?.response?.data?.error || 'Failed to update blog')
      }
    }
  })

  const deleteBlogMutation = useMutation({
    mutationFn: ({ id }) => blogsService.delete(id),
    onSuccess: (_, variables) => {
      if (variables?.id) {
        removeBlogFromCache(variables.id)
      }
    },
    onError: (err, variables) => {
      if (handleAuthError?.(err)) return
      if (err?.response?.status === 404) {
        notify?.('Blog was already removed from server.')
        if (variables?.id) {
          removeBlogFromCache(variables.id)
        }
      } else {
        notify?.(err?.response?.data?.error || 'Failed to delete blog')
      }
    }
  })

  return {
    blogs: blogsQuery.data ?? [],
    isLoading: blogsQuery.isLoading,
    isError: blogsQuery.isError,
    error: blogsQuery.error,
    createBlog: createBlogMutation.mutate,
    updateBlog: updateBlogMutation.mutate,
    deleteBlog: deleteBlogMutation.mutate
  }
}

export default useBlogsData
