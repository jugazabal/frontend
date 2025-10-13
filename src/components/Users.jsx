import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import usersService from '../services/users'

const Users = () => {
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.getAll,
    retry: false
  })

  if (isLoading) return <p>Loading users...</p>
  if (isError) return <p>Failed to load users.</p>

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <Link to={`/users/${user.id}`}>{user.name || user.username}</Link> - {user.blogs?.length || 0} blogs
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Users