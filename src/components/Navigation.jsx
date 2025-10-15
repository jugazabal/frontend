import { Link } from 'react-router-dom'
import { Navbar, Nav, Container, Button, Form } from 'react-bootstrap'

const Navigation = ({ user, handleLogout, themeMode, onToggleTheme }) => {
  const isDark = themeMode === 'dark'

  return (
    <Navbar
      bg={isDark ? 'dark' : 'light'}
      data-bs-theme={themeMode}
      variant={isDark ? 'dark' : 'light'}
      expand="md"
      className="rounded shadow-sm mb-4"
    >
      <Container fluid>
        <Navbar.Brand
          as={Link}
          to="/"
          className={isDark ? 'text-light fw-semibold' : 'text-dark fw-semibold'}
        >
          Blog App
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="app-navigation" />
        <Navbar.Collapse id="app-navigation">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className={isDark ? 'text-light fw-semibold' : 'fw-semibold'}>
              Home
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/blogs"
              className={isDark ? 'text-light fw-semibold' : 'fw-semibold'}
            >
              Blogs
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/users"
              className={isDark ? 'text-light fw-semibold' : 'fw-semibold'}
            >
              Users
            </Nav.Link>
          </Nav>
          <div className="d-flex align-items-center gap-3">
            <Form.Check
              type="switch"
              id="theme-toggle"
              label={
                <span className={isDark ? 'text-light fw-semibold' : 'fw-semibold'}>
                  Dark mode
                </span>
              }
              checked={isDark}
              onChange={() => onToggleTheme()}
            />
            {user ? (
              <div className="d-flex align-items-center gap-2">
                <Navbar.Text className={`text-${isDark ? 'light' : 'dark'}`}>
                  Signed in as <span className="fw-semibold">{user.name || user.username}</span>
                </Navbar.Text>
                <Button
                  variant={isDark ? 'outline-light' : 'outline-primary'}
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                as={Link}
                to="/login"
                variant={isDark ? 'outline-light' : 'primary'}
                size="sm"
              >
                Login
              </Button>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Navigation