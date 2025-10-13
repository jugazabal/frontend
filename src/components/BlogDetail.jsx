import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import blogsService from '../services/blogs'
import { updateBlog } from '../reducers/blogReducer'

const BlogDetail = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const blogs = useSelector(state => state.blogs)
  const [newComment, setNewComment] = useState('')

  const blog = blogs?.find(b => b.id === id)
  if (!blog) return <p>Blog not found</p>

  const addComment = async (event) => {
    event.preventDefault()
    if (!newComment.trim()) return
    try {
      const updatedBlog = await blogsService.createComment(blog.id, newComment.trim())
      dispatch(updateBlog(updatedBlog))
      setNewComment('')
    } catch (err) {
      console.error('Failed to add comment', err)
    }
  }

  return (
    <div>
      <h2>{blog.content}</h2>
      <p>By {blog.user?.name || blog.user?.username}</p>
      <p>Important: {blog.important ? 'Yes' : 'No'}</p>
      <h3>Comments</h3>
      <ul>
        {blog.comments?.map((comment, index) => (
          <li key={index}>{comment}</li>
        )) || <li>No comments</li>}
      </ul>
      <form onSubmit={addComment}>
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment"
        />
        <button type="submit">Add Comment</button>
      </form>
    </div>
  )
}

export default BlogDetail