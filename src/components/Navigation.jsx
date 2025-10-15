import { Link, useLocation } from 'react-router-dom'

const Navigation = ({ user, handleLogout, themeMode, onToggleTheme }) => {
  const location = useLocation()
  const links = [
    { to: '/', label: 'home' },
    { to: '/blogs', label: 'notes' },
    { to: '/users', label: 'users' },
    { to: '/login', label: 'login' }
  ]

  const isDark = themeMode === 'dark'

  return (
    <header className="topbar">
      <nav className="topbar__nav" aria-label="Primary">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`topbar__link${location.pathname === to ? ' topbar__link--active' : ''}`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="topbar__actions">
        <label className="theme-toggle" htmlFor="theme-toggle">
          <input
            id="theme-toggle"
            type="checkbox"
            checked={isDark}
            onChange={onToggleTheme}
          />
          <span>dark mode</span>
        </label>
        {user ? (
          <>
            <span className="topbar__user">{user.name || user.username} logged in</span>
            <button type="button" className="topbar__logout" onClick={handleLogout}>
              logout
            </button>
          </>
        ) : (
          <Link to="/login" className="link-button">
            login
          </Link>
        )}
      </div>
    </header>
  )
}

export default Navigation