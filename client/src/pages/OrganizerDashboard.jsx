import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';

const OrganizerDashboard = () => {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [registrationCounts, setRegistrationCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiClient.get('/events?limit=100');

      const allEvents = response.data.events || [];

      const currentUserId = user?._id || user?.id;

      const ownEvents = allEvents.filter((event) => {
        const organizerId =
          typeof event.organizer === 'object'
            ? event.organizer?._id
            : event.organizer;

        return (
          currentUserId &&
          organizerId &&
          String(organizerId) === String(currentUserId)
        );
      });

      setEvents(ownEvents);
    } catch (err) {
      console.error('Organizer dashboard error:', err);

      setError(
        err.response?.data?.message ||
          'Unable to load your events.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationCounts = async (organizerEvents) => {
    if (!organizerEvents.length) {
      setRegistrationCounts({});
      return;
    }

    try {
      setLoadingRegistrations(true);

      const results = await Promise.all(
        organizerEvents.map(async (event) => {
          try {
            const response = await apiClient.get(
              `/registrations/event/${event._id}`
            );

            const registrations =
              response.data.registrations || [];

            return {
              eventId: event._id,
              count: registrations.filter(
                (registration) =>
                  registration.status === 'registered'
              ).length,
            };
          } catch (err) {
            console.error(
              `Unable to load registrations for ${event.title}:`,
              err
            );

            return {
              eventId: event._id,
              count: 0,
            };
          }
        })
      );

      const counts = {};

      results.forEach((result) => {
        counts[result.eventId] = result.count;
      });

      setRegistrationCounts(counts);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  useEffect(() => {
    if (events.length > 0) {
      fetchRegistrationCounts(events);
    } else {
      setRegistrationCounts({});
    }
  }, [events]);

  const formatDate = (date) => {
    if (!date) return 'Date unavailable';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isUpcoming = (event) => {
    if (!event.date) return false;

    const eventDate = new Date(event.date);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return eventDate >= today;
  };

  const totalRegistrations = useMemo(() => {
    return Object.values(registrationCounts).reduce(
      (total, count) => total + count,
      0
    );
  }, [registrationCounts]);

  const upcomingEvents = useMemo(() => {
    return events.filter(isUpcoming);
  }, [events]);

  const handleDelete = async (eventId, eventTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${eventTitle}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(eventId);
      setError('');

      await apiClient.delete(`/events/${eventId}`);

      setEvents((currentEvents) =>
        currentEvents.filter(
          (event) => event._id !== eventId
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to delete this event.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="organizer-dashboard-page">

        <div className="organizer-dashboard-shell">

          <div className="organizer-dashboard-loading">
            <div className="admin-loader"></div>
            <p>Loading your dashboard...</p>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="organizer-dashboard-page">

      <div className="organizer-dashboard-shell">

        {/* HEADER */}
        <section className="organizer-dashboard-header">

          <div>
            <p className="section-eyebrow">
              ORGANIZER SPACE
            </p>

            <h1>
              Welcome back
              {user?.name
                ? `, ${user.name.split(' ')[0]}`
                : ''}
              .
            </h1>

            <p>
              Manage your events, keep track of registrations,
              and keep EventHub up to date.
            </p>
          </div>

          <Link
            to="/create-event"
            className="organizer-create-button"
          >
            <span>+</span>
            Create Event
          </Link>

        </section>

        {/* ERROR */}
        {error && (
          <div className="organizer-dashboard-error">
            <div>
              <strong>Something went wrong.</strong>
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={() => fetchEvents()}
            >
              Try again
            </button>
          </div>
        )}

        {/* STATS */}
        <section className="organizer-stats">

          <article className="organizer-stat-card">
            <span className="organizer-stat-label">
              TOTAL EVENTS
            </span>

            <strong>{events.length}</strong>

            <span className="organizer-stat-note">
              Events you manage
            </span>
          </article>

          <article className="organizer-stat-card">
            <span className="organizer-stat-label">
              UPCOMING
            </span>

            <strong>{upcomingEvents.length}</strong>

            <span className="organizer-stat-note">
              Upcoming events
            </span>
          </article>

          <article className="organizer-stat-card">
            <span className="organizer-stat-label">
              REGISTRATIONS
            </span>

            <strong>
              {loadingRegistrations
                ? '—'
                : totalRegistrations}
            </strong>

            <span className="organizer-stat-note">
              Active registrations
            </span>
          </article>

        </section>

        {/* EVENTS */}
        <section className="organizer-events-section">

          <div className="organizer-section-heading">

            <div>
              <p className="section-eyebrow">
                YOUR EVENTS
              </p>

              <h2>Manage your events</h2>
            </div>

            <Link
              to="/create-event"
              className="organizer-secondary-button"
            >
              + New Event
            </Link>

          </div>

          {events.length === 0 ? (
            <div className="organizer-empty">

              <div className="organizer-empty-icon">
                +
              </div>

              <p className="section-eyebrow">
                READY WHEN YOU ARE
              </p>

              <h3>
                You haven't created an event yet.
              </h3>

              <p>
                Create your first event and it will
                automatically appear across EventHub.
              </p>

              <Link
                to="/create-event"
                className="organizer-empty-button"
              >
                Create Your First Event
                <span>→</span>
              </Link>

            </div>
          ) : (
            <div className="organizer-event-list">

              {events.map((event) => (
                <article
                  className="organizer-event-row"
                  key={event._id}
                >

                  <div className="organizer-event-main">

                    <div className="organizer-event-category">
                      {event.category || 'General'}
                    </div>

                    <h3>
                      {event.title}
                    </h3>

                    <div className="organizer-event-meta">

                      <span>
                        ◷ {formatDate(event.date)}
                      </span>

                      {event.time && (
                        <span>
                          · {event.time}
                        </span>
                      )}

                      {event.location && (
                        <span>
                          · {event.location}
                        </span>
                      )}

                    </div>

                  </div>

                  <div className="organizer-event-registration">

                    <strong>
                      {loadingRegistrations
                        ? '—'
                        : registrationCounts[event._id] || 0}
                    </strong>

                    <span>
                      registrations
                    </span>

                  </div>

                  <div className="organizer-event-actions">

                    <Link
                      to={`/events/${event._id}`}
                      className="organizer-action-view"
                    >
                      View
                    </Link>

                    <Link
                      to={`/edit-event/${event._id}`}
                      className="organizer-action-edit"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      className="organizer-action-delete"
                      disabled={
                        deletingId === event._id
                      }
                      onClick={() =>
                        handleDelete(
                          event._id,
                          event.title
                        )
                      }
                    >
                      {deletingId === event._id
                        ? 'Deleting...'
                        : 'Delete'}
                    </button>

                  </div>

                </article>
              ))}

            </div>
          )}

        </section>

      </div>

    </div>
  );
};

export default OrganizerDashboard;