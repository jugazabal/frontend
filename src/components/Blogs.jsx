import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Table, Form, Button, Spinner, Badge } from 'react-bootstrap'
import Blog from './Blog'
import blogsService from '../services/blogs'
import { setBlogs, appendBlog, updateBlog, removeBlog } from '../reducers/blogReducer'

const Blogs = ({ user, notify, handleAuthError }) => {
  const dispatch = useDispatch()
  const blogs = useSelector(state => state.blogs)
  const [newBlog, setNewBlog] = useState('')
  const [filter, setFilter] = useState('all')
  const [blogsLoading, setBlogsLoading] = useState(false)

  useEffect(() => {
    const fetchBlogs = async () => {
      setBlogsLoading(true)
      try {
        const blogs = await blogsService.getAll()
        dispatch(setBlogs(blogs))
      } catch (err) {
        if (!handleAuthError?.(err)) {
          notify?.('Failed to load blogs')
        }
      } finally {
        setBlogsLoading(false)
      }
    }
    fetchBlogs()
  }, [dispatch, notify, handleAuthError])

  const createBlog = async (blogObject) => {
    try {
      const created = await blogsService.create(blogObject)
      dispatch(appendBlog(created))
    } catch (err) {
      if (!handleAuthError?.(err)) {
        notify?.(err?.response?.data?.error || 'Failed to create blog')
      }
    }
  }

  const updateBlogAction = async (id, data) => {
    try {
      const updated = await blogsService.update(id, data)
      dispatch(updateBlog(updated))
    } catch (err) {
      if (handleAuthError?.(err)) return
      notify?.(err?.response?.data?.error || 'Failed to update blog')
    }
  }

  const deleteBlogFromServer = async (id) => {
    try {
      await blogsService.delete(id)
      dispatch(removeBlog(id))
    } catch (err) {
      if (handleAuthError?.(err)) return
      notify?.(err?.response?.data?.error || 'Failed to delete blog')
    }
  }

  const isOwner = (blog) => {
    const ownerId = typeof blog.user === 'object' && blog.user !== null
      ? blog.user.id
      : blog.user
    return Boolean(user && ownerId && user.id === ownerId)
  }

  const deleteBlog = id => {
    const blog = blogs.find(b => b.id === id)
    if (!blog) return
    if (!user) {
      notify('Login to delete blogs.')
      return
    }
    if (!isOwner(blog)) {
      notify('You can only delete your own blogs.')
      return
    }
    if (window.confirm('Delete this blog?')) {
      deleteBlogFromServer(blog.id)
    }
  }

  const toggleImportanceOf = id => {
    const blog = blogs.find(b => b.id === id)
    if (!blog) return
    if (!user) {
      notify('Login to update blogs.')
      return
    }
    if (!isOwner(blog)) {
      notify('You can only update your own blogs.')
      return
    }
    updateBlogAction(blog.id, { important: !blog.important })
  }

  const addBlog = (event) => {
    event.preventDefault()
    if (!user) {
      notify('Login to add blogs.', 4000)
      return
    }
    const trimmed = newBlog.trim()
    if (!trimmed) {
      notify('Blog content cannot be empty', 4000)
      return
    }
    if (trimmed.length > 500) {
      notify('Blog content exceeds 500 characters limit', 4000)
      return
    }
    const blogObject = {
      content: trimmed,
      important: Math.random() > 0.5
    }
    createBlog(blogObject)
    setNewBlog('')
  }

  const handleBlogChange = (event) => {
    setNewBlog(event.target.value)
  }

  const blogsToShow = blogs.filter((blog) => {
    if (filter === 'important') {
      return blog.important
    }
    if (filter === 'mine') {
      return isOwner(blog)
    }
    return true
  })

  return (
    <div>
      <h2 className="mb-3">Blogs</h2>
      <Form className="border rounded p-3 bg-body-tertiary">
        <Form.Label className="fw-semibold">Filter blogs</Form.Label>
        <div className="d-flex flex-wrap gap-3">
          <Form.Check
            inline
            type="radio"
            id="blog-filter-all"
            label="All"
            name="blog-filter"
            value="all"
            checked={filter === 'all'}
            onChange={() => setFilter('all')}
          />
          <Form.Check
            inline
            type="radio"
            id="blog-filter-important"
            label="Important only"
            name="blog-filter"
            value="important"
            checked={filter === 'important'}
            onChange={() => setFilter('important')}
          />
          <Form.Check
            inline
            type="radio"
            id="blog-filter-mine"
            label={user ? 'Created by me' : 'Created by me (login required)'}
            name="blog-filter"
            value="mine"
            checked={filter === 'mine'}
            onChange={() => setFilter('mine')}
            disabled={!user}
          />
        </div>
      </Form>

      {blogsLoading ? (
        <div className="d-flex align-items-center gap-2 mt-4">
          <Spinner animation="border" role="status" size="sm" />
          <span>Loading blogs...</span>
        </div>
      ) : (
        <Table striped bordered hover responsive className="mt-4">
          <thead>
            <tr>
              <th>Content</th>
              <th>Owner</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogsToShow.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  No blogs match the selected filter.
                </td>
              </tr>
            ) : (
              blogsToShow.map((blog) => (
                <Blog
                  key={blog.id}
                  blog={blog}
                  onToggle={() => toggleImportanceOf(blog.id)}
                  onDelete={() => deleteBlog(blog.id)}
                  canModify={isOwner(blog)}
                />
              ))
            )}
          </tbody>
        </Table>
      )}

      {user ? (
        <Form onSubmit={addBlog} className="mt-4">
          <Form.Group controlId="newBlogContent" className="mb-3">
            <Form.Label>New blog content</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Share your thoughts..."
              value={newBlog}
              onChange={handleBlogChange}
            />
          </Form.Group>
          <div className="d-flex gap-2">
            <Button type="submit" variant="primary">
              Save blog
            </Button>
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => setNewBlog('')}
              disabled={!newBlog.trim()}
            >
              Clear
            </Button>
          </div>
        </Form>
      ) : (
        <Badge bg="secondary" className="mt-4">
          Log in to add new blogs.
        </Badge>
      )}
    </div>
  )
}

export default Blogs