import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import usersService from '../services/users'

const Users = () => {
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.getAll,
    retry: false
  })

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" gap={2} mt={2}>
        <CircularProgress size={24} />
        <Typography>Loading users...</Typography>
      </Box>
    )
  }

  if (isError) {
    return <Alert severity="error">Failed to load users.</Alert>
  }

  return (
    <Box>
      <AppBar position="static" color="primary" sx={{ borderRadius: 1, mb: 3 }}>
        <Toolbar>
          <Typography variant="h6" component="div">
            Users
          </Typography>
        </Toolbar>
      </AppBar>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Notes created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Button component={RouterLink} to={`/users/${user.id}`} variant="text">
                    {user.name || user.username}
                  </Button>
                </TableCell>
                <TableCell align="right">{user.notes?.length || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default Users