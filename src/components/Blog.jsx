
const Blog = ({ blog, onToggle, onDelete, canModify }) => {
  const owner = blog.user?.name || blog.user?.username
  return (
    <li>
      <span>{blog.content}</span>
      {owner && <span style={{ marginLeft: '0.5em', fontStyle: 'italic', color: '#555' }}>— {owner}</span>}
      <button
        onClick={onToggle}
        disabled={!canModify}
        style={{
          color: blog.important ? 'red' : 'blue',
          borderColor: blog.important ? 'red' : 'blue',
          borderWidth: '1px',
          borderStyle: 'solid',
          background: 'white',
          marginLeft: '0.5em',
          marginRight: '0.5em',
          cursor: canModify ? 'pointer' : 'not-allowed',
          opacity: canModify ? 1 : 0.5
        }}
      >
        make {blog.important ? 'not important' : 'important'}
      </button>
      <button
        onClick={onDelete}
        disabled={!canModify}
        style={{
          marginLeft: '0.5em',
          color: 'red',
          cursor: canModify ? 'pointer' : 'not-allowed',
          opacity: canModify ? 1 : 0.5
        }}
      >
        delete
      </button>
    </li>
  )
}

export default Blog
