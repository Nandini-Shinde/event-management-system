import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatEventDateRange } from '../utils/eventDate';
import EventCard from '../components/EventCard';

const formatPrice = (price) => {
  const numericPrice = Number(price);

  if (!numericPrice || numericPrice <= 0) {
    return 'Free';
  }

  return `₹${numericPrice.toLocaleString('en-IN')}`;
};

const toLocalCalendarDate = (dateValue, timeValue = '00:00') => {
  const value = `${dateValue}T${timeValue || '00:00'}:00`;
  return new Date(value);
};

const formatICSDate = (value) => {
  const date = new Date(value);

  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
};

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [shareMessage, setShareMessage] = useState('');

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

      const registrations = response.data.registrations || [];

      const currentRegistration = registrations.find((item) => {
        const registeredEvent =
          item.event?._id ||
          item.event?.id ||
          item.event;

        return (
          String(registeredEvent) === String(eventId) &&
          item.status !== 'cancelled'
        );
      });

      setRegistration(currentRegistration || null);
    } catch (err) {
      console.error('Failed to load registration status:', err);
      setRegistration(null);
    }
  };

  const loadRelatedEvents = async (currentEvent) => {
    if (!currentEvent?.category) {
      setRelatedEvents([]);
      return;
    }

    try {
      setRelatedLoading(true);

      const response = await apiClient.get('/events', {
        params: {
          category: currentEvent.category,
          page: 1,
          limit: 4
        }
      });

      const related = (response.data.events || [])
        .filter((item) => String(item._id) !== String(currentEvent._id))
        .slice(0, 3);

      setRelatedEvents(related);
    } catch (err) {
      console.error('Failed to load related events:', err);
      setRelatedEvents([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  useEffect(() => {
    loadRegistration();
  }, [eventId, isAuthenticated]);

  useEffect(() => {
    if (event) {
      loadRelatedEvents(event);
    }
  }, [event]);

  const eventDate = useMemo(
    () => formatEventDateRange(event?.date, event?.endDate, { long: true }),
    [event]
  );

  const shortDate = useMemo(
    () => formatEventDateRange(event?.date, event?.endDate),
    [event]
  );

  const eventPrice = useMemo(
    () => formatPrice(event?.price),
    [event]
  );

  const presentedBy = useMemo(() => {
    if (!event?.organizer) return 'EventHub';

    if (typeof event.organizer === 'string') {
      return event.organizer;
    }

    return (
      event.organizer.name ||
      event.organizer.fullName ||
      event.organizer.username ||
      'EventHub'
    );
  }, [event]);

  const eventEndDate = event?.endDate || event?.date;

  const isPastEvent = useMemo(() => {
    if (!eventEndDate) return false;

    const end = new Date(eventEndDate);
    end.setHours(23, 59, 59, 999);

    return end < new Date();
  }, [eventEndDate]);

  const capacityText = useMemo(() => {
    if (!event?.capacity) return 'Limited capacity';
    return `${event.capacity} seats`;
  }, [event]);

  const handleRegistration = async () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: `/events/${eventId}` }
      });
      return;
    }

    if (!event || isPastEvent) return;

    try {
      setRegistrationLoading(true);
      setActionError('');
      setActionMessage('');

      const response = await apiClient.post(`/registrations/${eventId}`);
      const createdRegistration = response.data.registration || response.data;

      setRegistration(createdRegistration || { event: eventId });
      setActionMessage('You are registered for this event.');
    } catch (err) {
      console.error('Failed to register for event:', err);

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

      await apiClient.delete(`/registrations/${registration._id}`);
      setRegistration(null);
      setActionMessage('Your registration has been cancelled.');
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          'Unable to cancel your registration.'
      );
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `Check out ${event.title} on EventHub.`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage('Shared successfully.');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareMessage('Event link copied to clipboard.');
      }
    } catch (shareError) {
      if (shareError?.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setShareMessage('Event link copied to clipboard.');
        } catch {
          setShareMessage('Copy the page URL to share this event.');
        }
      }
    }

    window.setTimeout(() => setShareMessage(''), 2800);
  };

  const handleCalendar = () => {
    const start = toLocalCalendarDate(event.date, event.time);
    const endDate = event.endDate || event.date;
    const end = toLocalCalendarDate(endDate, event.time);

    if (!event.endDate) {
      end.setMinutes(end.getMinutes() + 90);
    } else if (end <= start) {
      end.setDate(end.getDate() + 1);
    }

    const description = (event.description || '').replace(/[\r\n]+/g, '\\n');
    const location = (event.location || '').replace(/[\r\n]+/g, '\\n');

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EventHub//Event//EN',
      'BEGIN:VEVENT',
      `UID:${event._id}@eventhub`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(start)}`,
      `DTEND:${formatICSDate(end)}`,
      `SUMMARY:${event.title.replace(/[\r\n]+/g, ' ')}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `${event.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'event'}.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
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
          <p className="section-eyebrow">EVENT UNAVAILABLE</p>
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
              onClick={() => navigate('/events')}
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
      {shareMessage && (
        <div className="event-share-toast" role="status">
          <span>✓</span>
          {shareMessage}
        </div>
      )}

      <section className="event-details-hero">
        <div className="event-details-hero-glow glow-one" />
        <div className="event-details-hero-glow glow-two" />
        <div className="event-details-grid" />

        <div className="event-details-hero-content">
          <button
            type="button"
            className="event-details-back-button"
            onClick={() => navigate('/events')}
          >
            ← Back to events
          </button>

          <div className="event-details-category-row">
            <span className="event-details-category">
              {event.category || 'EVENT'}
            </span>
            <span className="event-details-price-badge">
              {eventPrice}
            </span>
          </div>

          <h1>{event.title}</h1>

          <p className="event-details-hero-description">
            {event.description || 'An experience worth showing up for.'}
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
              <strong>{event.location || 'Location TBA'}</strong>
            </div>
          </div>

          <div className="event-details-hero-actions">
            <button
              type="button"
              className="event-utility-button"
              onClick={handleShare}
            >
              <span>↗</span>
              Share event
            </button>

            <button
              type="button"
              className="event-utility-button"
              onClick={handleCalendar}
            >
              <span>◷</span>
              Add to calendar
            </button>

            {user?.role === 'admin' && (
              <button
                type="button"
                className="event-utility-button admin-utility"
                onClick={() => navigate(`/edit-event/${event._id}`)}
              >
                Edit event
              </button>
            )}
          </div>
        </div>

        <div className="event-details-hero-card">
          <div className="event-details-card-top">
            <span>{isPastEvent ? 'PAST EVENT' : 'UPCOMING EVENT'}</span>
            <span className={`event-status-dot ${isPastEvent ? 'past' : ''}`}>
              ● {isPastEvent ? 'ENDED' : 'LIVE'}
            </span>
          </div>

          <div className="event-details-visual">
            {event.image ? (
              <img
                src={event.image}
                alt=""
                loading="eager"
                decoding="async"
              />
            ) : null}
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
              <strong>{event.location || 'Location TBA'}</strong>
            </div>
          </div>
        </div>
      </section>

      <main className="event-details-main">
        <section className="event-details-layout">
          <div className="event-details-primary-column">
            <div className="event-details-section">
              <p className="section-eyebrow">ABOUT THE EVENT</p>
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
                <div><span>DATE</span><strong>{eventDate}</strong></div>
              </div>
              <div className="event-info-card">
                <span className="event-info-icon">⌁</span>
                <div><span>TIME</span><strong>{event.time || 'Time TBA'}</strong></div>
              </div>
              <div className="event-info-card">
                <span className="event-info-icon">◇</span>
                <div><span>LOCATION</span><strong>{event.location || 'Location TBA'}</strong></div>
              </div>
              <div className="event-info-card">
                <span className="event-info-icon">◎</span>
                <div><span>CAPACITY</span><strong>{capacityText}</strong></div>
              </div>
            </div>

            <div className="event-details-section organizer-section">
              <p className="section-eyebrow">PRESENTED BY</p>
              <div className="event-organizer-card">
                <div className="organizer-avatar">
                  {presentedBy.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{presentedBy}</h3>
                  <p>EventHub event team</p>
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
                {isPastEvent
                  ? 'This event has ended.'
                  : registration
                    ? "You're registered."
                    : 'Ready to experience it?'}
              </h3>

              <p>
                {isPastEvent
                  ? 'Registration is no longer available for this event.'
                  : registration
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
                  {registrationLoading ? 'Cancelling...' : 'Cancel Registration'}
                </button>
              ) : (
                <button
                  type="button"
                  className="event-registration-button"
                  onClick={handleRegistration}
                  disabled={registrationLoading || isPastEvent}
                >
                  {registrationLoading
                    ? 'Registering...'
                    : isPastEvent
                      ? 'Registration closed'
                      : isAuthenticated
                        ? 'Register for Event'
                        : 'Login to Register'}
                  {!isPastEvent && <span>→</span>}
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
                  Discover experiences, connect with people,
                  and create something worth remembering.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="event-related-section">
          <div className="event-related-heading">
            <div>
              <p className="section-eyebrow">MORE TO EXPLORE</p>
              <h2>More like this.</h2>
              <p>Keep the momentum going with another EventHub experience.</p>
            </div>

            <button
              type="button"
              className="view-all-button"
              onClick={() => navigate(`/events?category=${encodeURIComponent(event.category || '')}`)}
            >
              Browse category <span>→</span>
            </button>
          </div>

          {relatedLoading ? (
            <div className="event-related-loading">Finding more experiences…</div>
          ) : relatedEvents.length > 0 ? (
            <div className="featured-event-grid event-related-grid">
              {relatedEvents.map((related) => (
                <EventCard key={related._id} event={related} />
              ))}
            </div>
          ) : (
            <div className="event-related-empty">
              <span>✦</span>
              <p>New experiences are coming soon.</p>
            </div>
          )}
        </section>

        <section className="event-details-bottom-cta">
          <div>
            <p className="section-eyebrow">KEEP EXPLORING</p>
            <h2>
              There is always something
              <span> worth showing up for.</span>
            </h2>
          </div>

          <button
            type="button"
            className="event-details-primary-button"
            onClick={() => navigate('/events')}
          >
            Explore more events →
          </button>
        </section>
      </main>
    </div>
  );
};

export default EventDetails;
