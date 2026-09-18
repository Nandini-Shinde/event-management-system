import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const getUserName = () => {
    if (!user) return '';

    return (
      user.name ||
      user.fullName ||
      user.username ||
      user.email?.split('@')[0] ||
      'Account'
    );
  };

  const userRole = String(user?.role || '').toLowerCase();
  const userName = getUserName();

  return (
    <>
      <header className="site-navbar">
        <div className="navbar-inner">
          <NavLink to="/" className="navbar-brand" aria-label="EventHub home">
            <span className="navbar-brand-event">Event</span>
            <span className="navbar-brand-hub">Hub</span>
          </NavLink>

          <nav className="navbar-desktop-links" aria-label="Main navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `navbar-link ${isActive ? 'active' : ''}`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/events"
              className={({ isActive }) =>
                `navbar-link ${isActive ? 'active' : ''}`
              }
            >
              Events
            </NavLink>

            {isAuthenticated && (
              <NavLink
                to="/my-registrations"
                className={({ isActive }) =>
                  `navbar-link ${isActive ? 'active' : ''}`
                }
              >
                My Registrations
              </NavLink>
            )}

            {isAuthenticated && userRole === 'organizer' && (
              <NavLink
                to="/organizer-dashboard"
                className={({ isActive }) =>
                  `navbar-link ${isActive ? 'active' : ''}`
                }
              >
                Organizer
              </NavLink>
            )}

            {isAuthenticated && userRole === 'admin' && (
              <NavLink
                to="/admin-dashboard"
                className={({ isActive }) =>
                  `navbar-link ${isActive ? 'active' : ''}`
                }
              >
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
              <>
                <div className="navbar-user">
                  <span className="navbar-user-avatar">
                    {userName.charAt(0).toUpperCase()}
                  </span>

                  <div className="navbar-user-info">
                    <strong>{userName}</strong>
                    <span>{userRole || 'member'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="navbar-logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            className={`navbar-menu-button ${
              mobileOpen ? 'open' : ''
            }`}
            onClick={() => setMobileOpen((current) => !current)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        className={`navbar-mobile-panel ${
          mobileOpen ? 'open' : ''
        }`}
      >
        <nav aria-label="Mobile navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `navbar-mobile-link ${isActive ? 'active' : ''}`
            }
          >
            <span>01</span>
            Home
          </NavLink>

          <NavLink
            to="/events"
            className={({ isActive }) =>
              `navbar-mobile-link ${isActive ? 'active' : ''}`
            }
          >
            <span>02</span>
            Events
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/my-registrations"
              className={({ isActive }) =>
                `navbar-mobile-link ${isActive ? 'active' : ''}`
              }
            >
              <span>03</span>
              My Registrations
            </NavLink>
          )}

          {isAuthenticated && userRole === 'organizer' && (
            <NavLink
              to="/organizer-dashboard"
              className={({ isActive }) =>
                `navbar-mobile-link ${isActive ? 'active' : ''}`
              }
            >
              <span>04</span>
              Organizer Dashboard
            </NavLink>
          )}

          {isAuthenticated && userRole === 'admin' && (
            <NavLink
              to="/admin-dashboard"
              className={({ isActive }) =>
                `navbar-mobile-link ${isActive ? 'active' : ''}`
              }
            >
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
                <span className="navbar-user-avatar">
                  {userName.charAt(0).toUpperCase()}
                </span>

                <div className="navbar-user-info">
                  <strong>{userName}</strong>
                  <span>{userRole || 'member'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
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