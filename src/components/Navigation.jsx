import { Link } from 'react-router-dom'
import { Navbar, Nav, Container, Button } from 'react-bootstrap'

const Navigation = ({ user, handleLogout }) => {
  return (
    <Navbar bg="dark" variant="dark" expand="md" className="rounded shadow-sm">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          Blog App
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="app-navigation" />
        <Navbar.Collapse id="app-navigation">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/blogs">
              Blogs
            </Nav.Link>
            <Nav.Link as={Link} to="/users">
              Users
            </Nav.Link>
          </Nav>
          {user ? (
            <div className="d-flex align-items-center gap-2">
              <Navbar.Text className="text-light">
                Signed in as <span className="fw-semibold">{user.name || user.username}</span>
              </Navbar.Text>
              <Button variant="outline-light" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <Button as={Link} to="/login" variant="outline-light" size="sm">
              Login
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Navigation