import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { formatEventDateRange } from '../utils/eventDate';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [registrationCounts, setRegistrationCounts] = useState({});
  const [attendeeLists, setAttendeeLists] = useState({});
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAttendees, setLoadingAttendees] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiClient.get('/events', {
        params: { page: 1, limit: 50 }
      });

      setEvents(response.data.events || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load events.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async (eventList) => {
    if (!eventList.length) {
      setRegistrationCounts({});
      return;
    }

    const results = await Promise.all(
      eventList.map(async (event) => {
        try {
          const response = await apiClient.get(
            `/registrations/event/${event._id}`
          );
          return [
            event._id,
            response.data.registrations?.length || 0
          ];
        } catch {
          return [event._id, 0];
        }
      })
    );

    setRegistrationCounts(Object.fromEntries(results));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchCounts(events);
  }, [events]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events.filter((event) => {
      const start = new Date(event.date);
      return !Number.isNaN(start.getTime()) && start >= today;
    });
  }, [events]);

  const totalRegistrations = useMemo(
    () => Object.values(registrationCounts).reduce(
      (sum, count) => sum + count,
      0
    ),
    [registrationCounts]
  );

  const handleDelete = async (eventId, eventTitle) => {
    const confirmed = window.confirm(
      `Delete "${eventTitle}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(eventId);
      await apiClient.delete(`/events/${eventId}`);
      setExpandedEvent(null);
      setEvents((current) =>
        current.filter((event) => event._id !== eventId)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to delete the event.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const toggleAttendees = async (eventId) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
      return;
    }

    if (attendeeLists[eventId]) {
      setExpandedEvent(eventId);
      return;
    }

    try {
      setLoadingAttendees(eventId);

      const response = await apiClient.get(
        `/registrations/event/${eventId}`
      );

      setAttendeeLists((current) => ({
        ...current,
        [eventId]: response.data.registrations || []
      }));
      setExpandedEvent(eventId);
      setRegistrationCounts((current) => ({
        ...current,
        [eventId]: response.data.registrations?.length || 0
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load registrations.'
      );
    } finally {
      setLoadingAttendees(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <p className="admin-eyebrow">ADMIN CONTROL CENTER</p>
          <h1>Everything in one place.</h1>
          <p>
            Publish events, update details, remove old listings,
            and see who has registered without touching the code.
          </p>
        </div>

        <Link to="/create-event" className="admin-add-button">
          <span>+</span>
          Add Event
        </Link>
      </div>

      <section className="admin-stats-grid">
        <article className="admin-stat-card">
          <span>EVENTS</span>
          <strong>{events.length}</strong>
          <small>Total published events</small>
        </article>

        <article className="admin-stat-card">
          <span>UPCOMING</span>
          <strong>{upcomingEvents.length}</strong>
          <small>Events still ahead</small>
        </article>

        <article className="admin-stat-card">
          <span>REGISTRATIONS</span>
          <strong>{totalRegistrations}</strong>
          <small>Active registrations</small>
        </article>
      </section>

      <section className="admin-content">
        <div className="admin-section-header">
          <div>
            <p className="admin-eyebrow">EVENT MANAGEMENT</p>
            <h2>All events</h2>
            <p>
              {events.length}{' '}
              {events.length === 1 ? 'event' : 'events'} on EventHub
            </p>
          </div>

          <button
            type="button"
            className="admin-refresh-button"
            onClick={fetchEvents}
          >
            ↻ Refresh
          </button>
        </div>

        {loading && (
          <div className="admin-state">
            <div className="admin-loader" />
            <p>Loading your event library...</p>
          </div>
        )}

        {!loading && error && (
          <div className="admin-error">
            <strong>Something went wrong.</strong>
            <p>{error}</p>
            <button type="button" onClick={fetchEvents}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="admin-empty">
            <div className="admin-empty-icon">+</div>
            <h3>No events yet</h3>
            <p>
              Create your first event and it will immediately appear
              on the public EventHub pages.
            </p>
            <Link to="/create-event" className="admin-empty-button">
              Create First Event
            </Link>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="admin-event-list">
            {events.map((event) => {
              const attendees = attendeeLists[event._id] || [];
              const isExpanded = expandedEvent === event._id;

              return (
                <article className="admin-event-card" key={event._id}>
                  <div className="admin-event-info">
                    <div className="admin-event-category">
                      {event.category || 'General'}
                    </div>

                    <h3>{event.title}</h3>

                    <p>
                      {event.description || 'No description available.'}
                    </p>

                    <div className="admin-event-meta">
                      <span>
                        📅 {formatEventDateRange(event.date, event.endDate)}
                      </span>
                      {event.time && <span>🕐 {event.time}</span>}
                      {event.location && <span>📍 {event.location}</span>}
                    </div>
                  </div>

                  <div className="admin-event-side">
                    <strong>
                      {registrationCounts[event._id] ?? '—'}
                    </strong>
                    <span>registered</span>
                  </div>

                  <div className="admin-event-actions">
                    <Link
                      to={`/events/${event._id}`}
                      className="admin-action-view"
                    >
                      View
                    </Link>

                    <Link
                      to={`/edit-event/${event._id}`}
                      className="admin-action-edit"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      className="admin-action-attendees"
                      onClick={() => toggleAttendees(event._id)}
                      disabled={loadingAttendees === event._id}
                    >
                      {loadingAttendees === event._id
                        ? 'Loading...'
                        : isExpanded
                          ? 'Hide'
                          : 'Attendees'}
                    </button>

                    <button
                      type="button"
                      className="admin-action-delete"
                      onClick={() =>
                        handleDelete(event._id, event.title)
                      }
                      disabled={deletingId === event._id}
                    >
                      {deletingId === event._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="admin-attendees-panel">
                      <div className="admin-attendees-heading">
                        <div>
                          <p className="admin-eyebrow">REGISTRATIONS</p>
                          <h4>People attending</h4>
                        </div>
                        <span>
                          {attendees.length} / {event.capacity}
                        </span>
                      </div>

                      {attendees.length === 0 ? (
                        <p className="admin-attendees-empty">
                          No active registrations yet.
                        </p>
                      ) : (
                        <div className="admin-attendees-list">
                          {attendees.map((registration) => (
                            <div
                              className="admin-attendee-row"
                              key={registration._id}
                            >
                              <span className="admin-attendee-avatar">
                                {(registration.user?.name || '?')
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                              <div>
                                <strong>
                                  {registration.user?.name || 'Unknown user'}
                                </strong>
                                <span>
                                  {registration.user?.email || 'No email'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
