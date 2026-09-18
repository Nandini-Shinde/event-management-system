import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      await login(email.trim(), password);

      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to log in. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-background-glow glow-left"></div>
      <div className="auth-background-glow glow-right"></div>

      <div className="auth-container">

        {/* LEFT SIDE */}
        <section className="auth-showcase">

          <Link to="/" className="auth-logo">
            Event<span>Hub</span>
          </Link>

          <div className="auth-showcase-content">

            <p className="auth-eyebrow">
              WELCOME BACK
            </p>

            <h1>
              Your next
              <br />
              experience
              <br />
              <span>starts here.</span>
            </h1>

            <p>
              Sign in to discover events, manage your
              registrations, and keep your experiences
              in one place.
            </p>

          </div>

          <div className="auth-showcase-footer">
            <span>Discover</span>
            <span>Connect</span>
            <span>Experience</span>
          </div>

        </section>

        {/* RIGHT SIDE */}
        <section className="auth-form-panel">

          <div className="auth-form-wrapper">

            <div className="auth-form-heading">
              <p className="auth-small-label">
                ACCOUNT LOGIN
              </p>

              <h2>Welcome back.</h2>

              <p>
                Enter your details to continue to EventHub.
              </p>
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >

              <div className="auth-field">
                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="password">
                  Password
                </label>

                <div className="password-wrapper">

                  <input
                    id="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>

                </div>
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <span>→</span>
                  </>
                )}
              </button>

            </form>

            <div className="auth-switch">
              <span>Don't have an account?</span>

              <Link to="/register">
                Create one
              </Link>
            </div>

          </div>

        </section>

      </div>

    </div>
  );
};

export default Login;