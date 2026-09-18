import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import apiClient from '../services/api';
import EventCard from '../components/EventCard';

const formatDate = (date) => {
  if (!date) return 'Date TBA';

  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const Home = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventError, setEventError] = useState('');

  const loadFeaturedEvents = async () => {
    try {
      setLoadingEvents(true);
      setEventError('');

      const response = await apiClient.get('/events', {
        params: {
          page: 1,
          limit: 3
        }
      });

      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Failed to load featured events:', error);
      setEventError('Unable to load featured events right now.');
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadFeaturedEvents();
  }, []);

  const heroEvent = useMemo(() => {
    return events[0] || null;
  }, [events]);

  const heroEventTitle = heroEvent?.title || 'Tech Fest 2026';
  const heroEventCategory = heroEvent?.category || 'Technology';
  const heroEventDate = formatDate(heroEvent?.date || '2026-12-15');
  const heroEventLocation =
    heroEvent?.location || 'College Auditorium';

  return (
    <div className="home-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="hero-section">
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />
        <div className="hero-grid" />

        <div className="hero-content">

          <div className="hero-badge">
            <span className="badge-dot" />
            Discover something extraordinary
          </div>

          <p className="hero-eyebrow">
            DISCOVER • CONNECT • EXPERIENCE
          </p>

          <h1>
            Events that turn
            <br />
            <span>moments into memories.</span>
          </h1>

          <p className="hero-description">
            Discover unforgettable experiences, connect with your
            community, and find something worth showing up for.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="hero-primary-button"
              onClick={() => navigate('/events')}
            >
              <span>Explore Events</span>
              <span className="button-arrow">→</span>
            </button>

            <button
              type="button"
              className="hero-secondary-button"
              onClick={() => navigate('/register')}
            >
              Create your account
            </button>
          </div>

          <div className="hero-trust">
            <div className="trust-avatars" aria-hidden="true">
              <span>U</span>
              <span>E</span>
              <span>H</span>
            </div>

            <div>
              <strong>Built for experiences</strong>
              <p>Find your next unforgettable event.</p>
            </div>
          </div>

        </div>

        {/* HERO EVENT PREVIEW */}

        <div className="hero-visual">
          <div className="visual-glow" />

          <div className="floating-card main-card">

            <div className="card-top">
              <span className="small-label">
                UPCOMING EVENT
              </span>

              <span className="live-dot">
                DISCOVER
              </span>
            </div>

            <div className="event-preview-image">
              <div className="image-overlay" />

              <div className="preview-content">
                <span>
                  {heroEventCategory.toUpperCase()}
                </span>

                <h3>{heroEventTitle}</h3>
              </div>
            </div>

            <div className="preview-info">
              <div>
                <span>DATE</span>
                <strong>{heroEventDate}</strong>
              </div>

              <div>
                <span>LOCATION</span>
                <strong>{heroEventLocation}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                heroEvent
                  ? navigate(`/events/${heroEvent._id}`)
                  : navigate('/events')
              }
              className="preview-button"
            >
              View Event
              <span>→</span>
            </button>

          </div>

          <div className="floating-card mini-card mini-one">
            <span className="mini-icon">✦</span>

            <div>
              <strong>Discover</strong>
              <p>New experiences</p>
            </div>
          </div>

          <div className="floating-card mini-card mini-two">
            <span className="mini-icon">✓</span>

            <div>
              <strong>Register</strong>
              <p>In a few clicks</p>
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          FEATURED EVENTS
      ===================================================== */}

      <section className="featured-events-section">

        <div className="featured-header">

          <div>
            <p className="section-eyebrow">
              WHAT'S HAPPENING
            </p>

            <h2>Featured events</h2>

            <p className="featured-subtitle">
              Experiences worth showing up for.
            </p>
          </div>

          <button
            type="button"
            className="view-all-button"
            onClick={() => navigate('/events')}
          >
            View all events
            <span>→</span>
          </button>

        </div>

        {loadingEvents && (
          <div className="featured-event-grid">
            {[1, 2, 3].map((item) => (
              <div className="event-card event-card-loading" key={item}>
                <div className="event-card-loading-image" />

                <div className="event-card-loading-content">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loadingEvents && eventError && (
          <div className="featured-state error-state">
            <div className="empty-icon">!</div>

            <h3>We couldn't load the events.</h3>

            <p>{eventError}</p>

            <button
              type="button"
              onClick={loadFeaturedEvents}
            >
              Try again
            </button>
          </div>
        )}

        {!loadingEvents &&
          !eventError &&
          events.length === 0 && (
            <div className="featured-empty">
              <div className="empty-icon">✦</div>

              <h3>No featured events yet</h3>

              <p>
                New experiences are coming soon.
              </p>

              <button
                type="button"
                onClick={() => navigate('/events')}
              >
                Explore events
              </button>
            </div>
          )}

        {!loadingEvents &&
          !eventError &&
          events.length > 0 && (
            <div className="featured-event-grid">
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                />
              ))}
            </div>
          )}

      </section>

      {/* =====================================================
          CATEGORIES
      ===================================================== */}

      <section className="home-categories-section">

        <div className="categories-header">
          <div>
            <p className="section-eyebrow">
              EXPLORE YOUR INTERESTS
            </p>

            <h2>
              Find your kind
              <br />
              of experience.
            </h2>
          </div>

          <p className="categories-description">
            From technology and music to workshops and culture,
            discover experiences that match what you love.
          </p>
        </div>

        <div className="home-category-grid">

          <button
            type="button"
            className="home-category-card category-tech"
            onClick={() =>
              navigate('/events?category=Technology')
            }
          >
            <span className="category-number">01</span>
            <span className="category-icon">✦</span>

            <div>
              <h3>Technology</h3>
              <p>Innovation, coding & ideas</p>
            </div>

            <span className="category-arrow">↗</span>
          </button>

          <button
            type="button"
            className="home-category-card category-music"
            onClick={() =>
              navigate('/events?category=Music')
            }
          >
            <span className="category-number">02</span>
            <span className="category-icon">♫</span>

            <div>
              <h3>Music</h3>
              <p>Live shows & unforgettable nights</p>
            </div>

            <span className="category-arrow">↗</span>
          </button>

          <button
            type="button"
            className="home-category-card category-sports"
            onClick={() =>
              navigate('/events?category=Sports')
            }
          >
            <span className="category-number">03</span>
            <span className="category-icon">◉</span>

            <div>
              <h3>Sports</h3>
              <p>Competition, energy & action</p>
            </div>

            <span className="category-arrow">↗</span>
          </button>

          <button
            type="button"
            className="home-category-card category-workshop"
            onClick={() =>
              navigate('/events?category=Workshop')
            }
          >
            <span className="category-number">04</span>
            <span className="category-icon">◇</span>

            <div>
              <h3>Workshops</h3>
              <p>Learn something new</p>
            </div>

            <span className="category-arrow">↗</span>
          </button>

          <button
            type="button"
            className="home-category-card category-cultural"
            onClick={() =>
              navigate('/events?category=Cultural')
            }
          >
            <span className="category-number">05</span>
            <span className="category-icon">◎</span>

            <div>
              <h3>Cultural</h3>
              <p>Art, community & tradition</p>
            </div>

            <span className="category-arrow">↗</span>
          </button>

        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="home-cta-section">

        <div className="cta-glow" />

        <div className="cta-content">

          <p className="cta-eyebrow">
            YOUR NEXT EXPERIENCE IS WAITING
          </p>

          <h2>
            Don't just attend.
            <br />
            <span>Experience it.</span>
          </h2>

          <p>
            Explore upcoming events and find something
            worth remembering.
          </p>

          <button
            type="button"
            className="cta-button"
            onClick={() => navigate('/events')}
          >
            Explore All Events
            <span>→</span>
          </button>

        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="site-footer">

        <div className="footer-top">

          <div className="footer-brand">

            <div className="footer-logo">
              Event<span>Hub</span>
            </div>

            <p>
              Discover experiences.
              <br />
              Make memories.
            </p>

          </div>

          <div className="footer-links">

            <div>
              <h4>Explore</h4>

              <button
                type="button"
                onClick={() => navigate('/events')}
              >
                Events
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate('/events?category=Technology')
                }
              >
                Technology
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate('/events?category=Music')
                }
              >
                Music
              </button>
            </div>

            <div>
              <h4>Account</h4>

              <button
                type="button"
                onClick={() => navigate('/login')}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </div>

          </div>

        </div>

        <div className="footer-bottom">
          <span>© 2026 EventHub</span>
          <span>Built for experiences.</span>
        </div>

      </footer>

    </div>
  );
};

export default Home;