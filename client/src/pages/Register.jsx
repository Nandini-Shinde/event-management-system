import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getPasswordStrength = () => {
    if (!password) return '';

    if (password.length < 7) {
      return 'weak';
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const score = [
      hasUppercase,
      hasNumber,
      hasSpecial
    ].filter(Boolean).length;

    if (password.length >= 10 && score >= 2) {
      return 'strong';
    }

    return 'medium';
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setError('Please complete all fields.');
      return;
    }

    if (password.length < 7) {
      setError('Password must be at least 7 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      await register(
        trimmedName,
        trimmedEmail,
        password
      );

      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to create your account. Please try again.'
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
              JOIN EVENTHUB
            </p>

            <h1>
              Make room
              <br />
              for your next
              <br />
              <span>great experience.</span>
            </h1>

            <p>
              Create your EventHub account and start
              discovering events, experiences, and
              moments worth remembering.
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
                CREATE ACCOUNT
              </p>

              <h2>Join EventHub.</h2>

              <p>
                Create your account and start exploring.
              </p>

            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <form
              className="auth-form register-form"
              onSubmit={handleSubmit}
            >

              {/* NAME */}
              <div className="auth-field">

                <label htmlFor="register-name">
                  Full name
                </label>

                <input
                  id="register-name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  autoComplete="name"
                />

              </div>

              {/* EMAIL */}
              <div className="auth-field">

                <label htmlFor="register-email">
                  Email address
                </label>

                <input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                />

              </div>

              {/* PASSWORD */}
              <div className="auth-field">

                <label htmlFor="register-password">
                  Password
                </label>

                <div className="password-wrapper">

                  <input
                    id="register-password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="new-password"
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

                {password && (
                  <div className="password-strength">

                    <div className="password-strength-bars">

                      <span
                        className={
                          passwordStrength === 'weak' ||
                          passwordStrength === 'medium' ||
                          passwordStrength === 'strong'
                            ? 'filled'
                            : ''
                        }
                      ></span>

                      <span
                        className={
                          passwordStrength === 'medium' ||
                          passwordStrength === 'strong'
                            ? 'filled'
                            : ''
                        }
                      ></span>

                      <span
                        className={
                          passwordStrength === 'strong'
                            ? 'filled'
                            : ''
                        }
                      ></span>

                    </div>

                    <small>
                      {passwordStrength === 'weak'
                        ? 'Use at least 7 characters.'
                        : passwordStrength === 'medium'
                          ? 'Good password. Add a special character for extra strength.'
                          : 'Strong password.'}
                    </small>

                  </div>
                )}

              </div>

              {/* CONFIRM PASSWORD */}
              <div className="auth-field">

                <label htmlFor="register-confirm">
                  Confirm password
                </label>

                <div className="password-wrapper">

                  <input
                    id="register-confirm"
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword
                      ? 'Hide'
                      : 'Show'}
                  </button>

                </div>

                {confirmPassword && (
                  <small
                    className={
                      password === confirmPassword
                        ? 'password-match success'
                        : 'password-match'
                    }
                  >
                    {password === confirmPassword
                      ? '✓ Passwords match'
                      : 'Passwords do not match'}
                  </small>
                )}

              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner"></span>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span>→</span>
                  </>
                )}
              </button>

            </form>

            <div className="auth-switch">
              <span>Already have an account?</span>

              <Link to="/login">
                Sign in
              </Link>
            </div>

          </div>

        </section>

      </div>

    </div>
  );
};

export default Register;