import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!accountRef.current?.contains(event.target)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    setAccountOpen(false);
    navigate('/');
  };

  const userName =
    user?.name ||
    user?.email?.split('@')[0] ||
    'Account';

  const isAdmin = user?.role === 'admin';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'A';

  const navClass = ({ isActive }) =>
    `navbar-link ${isActive ? 'active' : ''}`;

  const mobileClass = ({ isActive }) =>
    `navbar-mobile-link ${isActive ? 'active' : ''}`;

  return (
    <>
      <header className="site-navbar">
        <div className="navbar-inner">
          <NavLink
            to="/"
            className="navbar-brand"
            aria-label="EventHub home"
          >
            <span className="navbar-brand-event">Event</span>
            <span className="navbar-brand-hub">Hub</span>
            <span className="navbar-brand-mark" aria-hidden="true">•</span>
          </NavLink>

          <nav className="navbar-desktop-links" aria-label="Main navigation">
            <NavLink to="/" end className={navClass}>Home</NavLink>
            <NavLink to="/events" className={navClass}>Events</NavLink>

            {isAuthenticated && (
              <NavLink to="/my-registrations" className={navClass}>
                My Registrations
              </NavLink>
            )}

            {isAdmin && (
              <NavLink to="/admin-dashboard" className={navClass}>
                <span className="navbar-admin-dot" aria-hidden="true" />
                Admin
              </NavLink>
            )}
          </nav>

          <div className="navbar-desktop-actions">
            {!isAuthenticated ? (
              <>
                <button
                  type="button"
                  className="navbar-login-button"
                  onClick={() => navigate('/login')}
                >
                  Log in
                </button>

                <button
                  type="button"
                  className="navbar-register-button"
                  onClick={() => navigate('/register')}
                >
                  Get started
                  <span>→</span>
                </button>
              </>
            ) : (
              <div className="navbar-account-wrap" ref={accountRef}>
                <button
                  type="button"
                  className={`navbar-account-button ${accountOpen ? 'open' : ''}`}
                  onClick={() => setAccountOpen((current) => !current)}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                >
                  <span className="navbar-user-avatar">{initials}</span>
                  <span className="navbar-user-info">
                    <strong>{userName}</strong>
                    <span>{isAdmin ? 'Admin account' : 'Event member'}</span>
                  </span>
                  <span className="navbar-account-chevron" aria-hidden="true">⌄</span>
                </button>

                {accountOpen && (
                  <div className="navbar-account-menu" role="menu">
                    <div className="navbar-account-menu-head">
                      <span className="navbar-user-avatar large">{initials}</span>
                      <div>
                        <strong>{userName}</strong>
                        <span>{user?.email}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => navigate('/my-registrations')}
                    >
                      <span>▣</span>
                      My Registrations
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => navigate('/admin-dashboard')}
                      >
                        <span>◆</span>
                        Admin Dashboard
                      </button>
                    )}

                    <div className="navbar-account-divider" />

                    <button
                      type="button"
                      role="menuitem"
                      className="logout-item"
                      onClick={handleLogout}
                    >
                      <span>↪</span>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className={`navbar-menu-button ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen((current) => !current)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="eventhub-mobile-navigation"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        id="eventhub-mobile-navigation"
        className={`navbar-mobile-panel ${mobileOpen ? 'open' : ''}`}
      >
        <div className="navbar-mobile-panel-inner">
          <div className="navbar-mobile-kicker">
            EventHub navigation
          </div>

          <nav aria-label="Mobile navigation">
            <NavLink to="/" end className={mobileClass}>
              <span>01</span>
              Home
            </NavLink>

            <NavLink to="/events" className={mobileClass}>
              <span>02</span>
              Events
            </NavLink>

            {isAuthenticated && (
              <NavLink to="/my-registrations" className={mobileClass}>
                <span>03</span>
                My Registrations
              </NavLink>
            )}

            {isAdmin && (
              <NavLink to="/admin-dashboard" className={mobileClass}>
                <span>04</span>
                Admin Dashboard
              </NavLink>
            )}
          </nav>

          <div className="navbar-mobile-footer">
            {!isAuthenticated ? (
              <div className="navbar-mobile-auth">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate('/login');
                  }}
                >
                  Log in
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate('/register');
                  }}
                >
                  Get started →
                </button>
              </div>
            ) : (
              <div className="navbar-mobile-authenticated">
                <div className="navbar-user">
                  <span className="navbar-user-avatar">{initials}</span>
                  <div className="navbar-user-info">
                    <strong>{userName}</strong>
                    <span>{isAdmin ? 'Admin account' : 'Event member'}</span>
                  </div>
                </div>

                <button type="button" onClick={handleLogout}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <button
          type="button"
          className="navbar-mobile-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
