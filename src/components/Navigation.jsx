import { Link } from 'react-router-dom'

const Navigation = ({ user, handleLogout }) => {
  return (
    <nav style={{ marginBottom: '1rem', padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
      <Link to="/blogs" style={{ marginRight: '1rem' }}>Blogs</Link>
      <Link to="/users" style={{ marginRight: '1rem' }}>Users</Link>
      {user ? (
        <>
          <span>{user.name || user.username} logged in</span>
          <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>logout</button>
        </>
      ) : (
        <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
      )}
    </nav>
  )
}

export default Navigation