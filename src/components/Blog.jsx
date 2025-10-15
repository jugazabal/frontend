
import { Button, Badge } from 'react-bootstrap'

const Blog = ({ blog, onToggle, onDelete, canModify }) => {
  const owner = blog.user?.name || blog.user?.username

  return (
    <tr>
      <td>{blog.content}</td>
      <td>{owner || '—'}</td>
      <td>
        <Badge bg={blog.important ? 'warning' : 'secondary'} text={blog.important ? 'dark' : undefined}>
          {blog.important ? 'Important' : 'Regular'}
        </Badge>
      </td>
      <td className="text-end">
        <Button
          variant={blog.important ? 'outline-danger' : 'outline-primary'}
          size="sm"
          onClick={onToggle}
          disabled={!canModify}
          className="me-2"
        >
          {blog.important ? 'Mark regular' : 'Mark important'}
        </Button>
        <Button variant="outline-danger" size="sm" onClick={onDelete} disabled={!canModify}>
          Delete
        </Button>
      </td>
    </tr>
  )
}

export default Blog
