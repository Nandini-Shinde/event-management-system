import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatDate = (date) => {
  if (!date) return 'Date TBA';

  return new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const formatShortDate = (date) => {
  if (!date) return 'TBA';

  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const formatPrice = (price) => {
  const numericPrice = Number(price);

  if (!numericPrice || numericPrice <= 0) {
    return 'Free';
  }

  return `₹${numericPrice.toLocaleString('en-IN')}`;
};

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [registration, setRegistration] = useState(null);

  const [loading, setLoading] = useState(true);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiClient.get(`/events/${eventId}`);

      setEvent(response.data.event || response.data);
    } catch (err) {
      console.error('Failed to load event:', err);

      setEvent(null);

      setError(
        err.response?.data?.message ||
          'Unable to load this event right now.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadRegistration = async () => {
    if (!isAuthenticated) {
      setRegistration(null);
      return;
    }

    try {
      const response = await apiClient.get('/registrations/my');

      const registrations =
        response.data.registrations ||
        response.data ||
        [];

      const currentRegistration = registrations.find(
        (item) => {
          const registeredEvent =
            item.event?._id ||
            item.event?.id ||
            item.event;

          return (
            String(registeredEvent) === String(eventId) &&
            item.status !== 'cancelled'
          );
        }
      );

      setRegistration(currentRegistration || null);
    } catch (err) {
      console.error(
        'Failed to load registration status:',
        err
      );

      setRegistration(null);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  useEffect(() => {
    loadRegistration();
  }, [eventId, isAuthenticated]);

  const eventDate = useMemo(
    () => formatDate(event?.date),
    [event]
  );

  const shortDate = useMemo(
    () => formatShortDate(event?.date),
    [event]
  );

  const eventPrice = useMemo(
    () => formatPrice(event?.price),
    [event]
  );

  const capacityText = useMemo(() => {
    if (!event?.capacity) return 'Limited capacity';

    return `${event.capacity} seats`;
  }, [event]);

  const organizerName = useMemo(() => {
    if (!event?.organizer) return 'Event Organizer';

    if (typeof event.organizer === 'string') {
      return event.organizer;
    }

    return (
      event.organizer.name ||
      event.organizer.fullName ||
      event.organizer.username ||
      'Event Organizer'
    );
  }, [event]);

  const handleRegistration = async () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: `/events/${eventId}`
        }
      });

      return;
    }

    if (!event) return;

    try {
      setRegistrationLoading(true);
      setActionError('');
      setActionMessage('');

      const response = await apiClient.post(
        `/registrations/${eventId}`
      );

      const createdRegistration =
        response.data.registration ||
        response.data;

      setRegistration(createdRegistration || { event: eventId });

      setActionMessage(
        'You are registered for this event.'
      );
    } catch (err) {
      console.error(
        'Failed to register for event:',
        err
      );

      setActionError(
        err.response?.data?.message ||
          'Unable to complete registration.'
      );
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleCancellation = async () => {
    if (!registration?._id) return;

    try {
      setRegistrationLoading(true);
      setActionError('');
      setActionMessage('');

      await apiClient.delete(
        `/registrations/${registration._id}`
      );

      setRegistration(null);

      setActionMessage(
        'Your registration has been cancelled.'
      );
    } catch (err) {
      console.error(
        'Failed to cancel registration:',
        err
      );

      setActionError(
        err.response?.data?.message ||
          'Unable to cancel your registration.'
      );
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/events');
  };

  if (loading) {
    return (
      <div className="event-details-page">
        <section className="event-details-loading">
          <div className="event-details-skeleton event-details-skeleton-hero" />

          <div className="event-details-loading-content">
            <span className="event-details-skeleton skeleton-small" />
            <span className="event-details-skeleton skeleton-title" />
            <span className="event-details-skeleton skeleton-title short" />
            <span className="event-details-skeleton skeleton-text" />
            <span className="event-details-skeleton skeleton-text" />
            <span className="event-details-skeleton skeleton-button" />
          </div>
        </section>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-details-page">
        <section className="event-details-state">
          <div className="event-details-state-icon">!</div>

          <p className="section-eyebrow">
            EVENT UNAVAILABLE
          </p>

          <h1>We couldn't load this event.</h1>

          <p>
            {error ||
              'The event may have been removed or is no longer available.'}
          </p>

          <div className="event-details-state-actions">
            <button
              type="button"
              className="event-details-primary-button"
              onClick={loadEvent}
            >
              Try again
            </button>

            <button
              type="button"
              className="event-details-secondary-button"
              onClick={handleBack}
            >
              Back to events
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="event-details-page">
      <section className="event-details-hero">
        <div className="event-details-hero-glow glow-one" />
        <div className="event-details-hero-glow glow-two" />
        <div className="event-details-grid" />

        <div className="event-details-hero-content">
          <button
            type="button"
            className="event-details-back-button"
            onClick={handleBack}
          >
            ← Back to events
          </button>

          <div className="event-details-category-row">
            <span className="event-details-category">
              {event.category || 'EVENT'}
            </span>

            {event.price !== undefined && (
              <span className="event-details-price-badge">
                {eventPrice}
              </span>
            )}
          </div>

          <h1>{event.title}</h1>

          <p className="event-details-hero-description">
            {event.description ||
              'An experience worth showing up for.'}
          </p>

          <div className="event-details-hero-meta">
            <div>
              <span>DATE</span>
              <strong>{shortDate}</strong>
            </div>

            <div>
              <span>TIME</span>
              <strong>{event.time || 'Time TBA'}</strong>
            </div>

            <div>
              <span>LOCATION</span>
              <strong>
                {event.location || 'Location TBA'}
              </strong>
            </div>
          </div>
        </div>

        <div className="event-details-hero-card">
          <div className="event-details-card-top">
            <span>UPCOMING EVENT</span>
            <span className="event-status-dot">
              ● LIVE
            </span>
          </div>

          <div className="event-details-visual">
            <div className="event-details-visual-overlay" />

            <div className="event-details-visual-content">
              <span>{event.category || 'EVENT'}</span>
              <strong>{event.title}</strong>
            </div>
          </div>

          <div className="event-details-card-info">
            <div>
              <span>WHEN</span>
              <strong>{eventDate}</strong>
              <p>{event.time || 'Time TBA'}</p>
            </div>

            <div>
              <span>WHERE</span>
              <strong>
                {event.location || 'Location TBA'}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <main className="event-details-main">
        <section className="event-details-layout">
          <div className="event-details-primary-column">
            <div className="event-details-section">
              <p className="section-eyebrow">
                ABOUT THE EVENT
              </p>

              <h2>Everything you need to know.</h2>

              <div className="event-details-description">
                <p>
                  {event.description ||
                    'No additional description is available for this event.'}
                </p>
              </div>
            </div>

            <div className="event-details-info-grid">
              <div className="event-info-card">
                <span className="event-info-icon">◷</span>
                <div>
                  <span>DATE</span>
                  <strong>{eventDate}</strong>
                </div>
              </div>

              <div className="event-info-card">
                <span className="event-info-icon">⌁</span>
                <div>
                  <span>TIME</span>
                  <strong>
                    {event.time || 'Time TBA'}
                  </strong>
                </div>
              </div>

              <div className="event-info-card">
                <span className="event-info-icon">◇</span>
                <div>
                  <span>LOCATION</span>
                  <strong>
                    {event.location || 'Location TBA'}
                  </strong>
                </div>
              </div>

              <div className="event-info-card">
                <span className="event-info-icon">◎</span>
                <div>
                  <span>CAPACITY</span>
                  <strong>{capacityText}</strong>
                </div>
              </div>
            </div>

            <div className="event-details-section organizer-section">
              <p className="section-eyebrow">
                ORGANIZED BY
              </p>

              <div className="event-organizer-card">
                <div className="organizer-avatar">
                  {organizerName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h3>{organizerName}</h3>
                  <p>
                    Event organizer
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="event-details-sidebar">
            <div className="event-registration-card">
              <div className="registration-card-heading">
                <span>YOUR SPOT</span>
                <strong>{eventPrice}</strong>
              </div>

              <h3>
  {registration
    ? "You're registered."
    : 'Ready to experience it?'}
</h3>

              <p>
                {registration
                  ? 'Your place at this event is confirmed. Keep this page handy for the event details.'
                  : 'Reserve your spot now and be part of the experience.'}
              </p>

              {actionError && (
                <div className="event-action-message event-action-error">
                  {actionError}
                </div>
              )}

              {actionMessage && (
                <div className="event-action-message event-action-success">
                  {actionMessage}
                </div>
              )}

              {registration ? (
                <button
                  type="button"
                  className="event-registration-button registered"
                  onClick={handleCancellation}
                  disabled={registrationLoading}
                >
                  {registrationLoading
                    ? 'Cancelling...'
                    : 'Cancel Registration'}
                </button>
              ) : (
                <button
                  type="button"
                  className="event-registration-button"
                  onClick={handleRegistration}
                  disabled={registrationLoading}
                >
                  {registrationLoading
                    ? 'Registering...'
                    : isAuthenticated
                      ? 'Register for Event'
                      : 'Login to Register'}
                  <span>→</span>
                </button>
              )}

              <div className="registration-card-footer">
                <span>✓ Secure registration</span>
                <span>✓ Instant confirmation</span>
              </div>
            </div>

            <div className="event-sidebar-note">
              <span>✦</span>

              <div>
                <strong>Make it memorable.</strong>
                <p>
                  Discover experiences,
                  connect with people, and
                  create something worth
                  remembering.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="event-details-bottom-cta">
          <div>
            <p className="section-eyebrow">
              KEEP EXPLORING
            </p>

            <h2>
              There is always something
              <span> worth showing up for.</span>
            </h2>
          </div>

          <button
            type="button"
            className="event-details-primary-button"
            onClick={handleBack}
          >
            Explore more events →
          </button>
        </section>
      </main>
    </div>
  );
};

export default EventDetails;