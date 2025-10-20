import { useState, useEffect, useMemo, useCallback } from 'react'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')
  const [blogsLoading, setBlogsLoading] = useState(false)

  const errorMessage = (err, fallback) => {
    return err?.graphQLErrors?.[0]?.message || err?.message || err?.response?.data?.error || fallback
  }

  useEffect(() => {
    const fetchBlogs = async () => {
      setBlogsLoading(true)
      try {
        const blogs = await blogsService.getAll()
        dispatch(setBlogs(blogs))
      } catch (err) {
        if (!handleAuthError?.(err)) {
          notify?.(errorMessage(err, 'Failed to load notes'))
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
      notify?.('Blog saved', 3000)
    } catch (err) {
      if (!handleAuthError?.(err)) {
        notify?.(errorMessage(err, 'Failed to create note'))
      }
    }
  }

  const updateBlogAction = async (id, data) => {
    try {
      const updated = await blogsService.update(id, data)
      dispatch(updateBlog(updated))
    } catch (err) {
      if (handleAuthError?.(err)) return
      notify?.(errorMessage(err, 'Failed to update note'))
    }
  }

  const deleteBlogFromServer = async (id) => {
    try {
      await blogsService.delete(id)
      dispatch(removeBlog(id))
      notify?.('Blog deleted', 3000)
    } catch (err) {
      if (handleAuthError?.(err)) return
      notify?.(errorMessage(err, 'Failed to delete note'))
    }
  }

  const isOwner = useCallback((blog) => {
    const ownerId = typeof blog.user === 'object' && blog.user !== null
      ? blog.user.id
      : blog.user
    return Boolean(user && ownerId && user.id === ownerId)
  }, [user])

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
    if (window.confirm(`Delete blog "${blog.content.slice(0, 30)}"?`)) {
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
    notify?.(blog.important ? 'Blog marked regular' : 'Blog marked important', 3000)
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
    const duplicate = blogs.some(blog => blog.content?.trim().toLowerCase() === trimmed.toLowerCase())
    if (duplicate) {
      notify?.('A blog with this content already exists', 4000)
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

  const filteredBlogs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    return blogs.filter((blog) => {
      if (filter === 'important' && !blog.important) {
        return false
      }
      if (filter === 'mine' && !isOwner(blog)) {
        return false
      }
      if (normalizedSearch) {
        const contentMatch = blog.content?.toLowerCase().includes(normalizedSearch)
        const ownerName = (blog.user?.name || blog.user?.username || '').toLowerCase()
        const ownerMatch = ownerName.includes(normalizedSearch)
        if (!contentMatch && !ownerMatch) {
          return false
        }
      }
      return true
    })
  }, [blogs, filter, searchTerm, isOwner])

  const blogsToShow = useMemo(() => {
    const getTimestamp = (blog) => {
      if (!blog.createdAt) return 0
      const parsed = Date.parse(blog.createdAt)
      return Number.isNaN(parsed) ? 0 : parsed
    }
    const copy = [...filteredBlogs]
    switch (sortOrder) {
      case 'oldest':
        return copy.sort((a, b) => getTimestamp(a) - getTimestamp(b))
      case 'importance':
        return copy.sort((a, b) => {
          if (a.important === b.important) {
            return getTimestamp(b) - getTimestamp(a)
          }
          return a.important ? -1 : 1
        })
      case 'newest':
      default:
        return copy.sort((a, b) => getTimestamp(b) - getTimestamp(a))
    }
  }, [filteredBlogs, sortOrder])

  return (
    <div>
      <h2 className="mb-3" id="blogs-heading">Blogs</h2>
      <p className="text-muted">
        Status column shows if a blog is marked <strong>Important</strong> or <strong>Regular</strong>.
      </p>
      <Form className="border rounded p-3 bg-body-tertiary" aria-labelledby="blogs-filter-heading">
        <Form.Label className="fw-semibold" id="blogs-filter-heading">Filter blogs</Form.Label>
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
            aria-describedby="filter-mine-help"
          />
        </div>
        {!user && (
          <div id="filter-mine-help" className="form-text">
            Log in to enable the &quot;Created by me&quot; filter.
          </div>
        )}
        <div className="d-flex flex-column flex-md-row gap-3 mt-3">
          <Form.Group controlId="blog-search" className="flex-grow-1">
            <Form.Label className="mb-1">Search</Form.Label>
            <Form.Control
              type="search"
              placeholder="Search by content or owner"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search blogs"
            />
          </Form.Group>
          <Form.Group controlId="blog-sort">
            <Form.Label className="mb-1">Sort</Form.Label>
            <Form.Select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="importance">Important first</option>
            </Form.Select>
          </Form.Group>
        </div>
      </Form>

      {blogsLoading ? (
        <div className="d-flex align-items-center gap-2 mt-4">
          <Spinner animation="border" role="status" size="sm" />
          <span>Loading blogs...</span>
        </div>
      ) : (
        <Table striped bordered hover responsive className="mt-4" aria-describedby="blogs-heading">
          <thead className="table-light">
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
                <td colSpan={4} className="text-center text-muted" role="status">
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
              onClick={() => {
                setNewBlog('')
                notify?.('Draft cleared', 2000)
              }}
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