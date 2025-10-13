import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import usersService from '../services/users'

const User = () => {
  const { id } = useParams()
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.getAll,
    retry: false
  })

  if (isLoading) return <p>Loading...</p>

  const user = users?.find(u => u.id === id)
  if (!user) return null

  return (
    <div>
      <h2>{user.name || user.username}</h2>
      <h3>Blogs</h3>
      <ul>
        {user.blogs?.map(blog => (
          <li key={blog.id}>{blog.title || blog.content}</li>
        )) || <li>No blogs</li>}
      </ul>
    </div>
  )
}

export default User