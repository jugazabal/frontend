import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import usersService from '../services/users'

const User = () => {
  const { id } = useParams()
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.getAll,
    retry: false
  })

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" gap={2} mt={2}>
        <CircularProgress size={24} />
        <Typography>Loading user...</Typography>
      </Box>
    )
  }

  if (isError) {
    return <Alert severity="error">Failed to load user.</Alert>
  }

  const user = users?.find((u) => u.id === id)
  if (!user) {
    return <Alert severity="info">User not found.</Alert>
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">{user.name || user.username}</Typography>
        <Chip label={`${user.blogs?.length || 0} blogs`} color="primary" />
      </Stack>
      <Typography variant="h6" gutterBottom>
        Blogs
      </Typography>
      <List>
        {user.blogs?.length ? (
          user.blogs.map((blog) => (
            <ListItem key={blog.id} divider>
              <ListItemText
                primary={blog.title || blog.content}
                secondary={blog.important ? 'Marked important' : undefined}
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="No blogs yet." />
          </ListItem>
        )}
      </List>
    </Paper>
  )
}

export default User