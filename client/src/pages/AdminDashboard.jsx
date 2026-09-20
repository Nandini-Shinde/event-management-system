import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import apiClient from '../services/api';
import { formatEventDateRange } from '../utils/eventDate';

const categories = [
  'Technology',
  'Music',
  'Sports',
  'Workshop',
  'Cultural'
];

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [registrationCounts, setRegistrationCounts] = useState({});
  const [attendeeLists, setAttendeeLists] = useState({});
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAttendees, setLoadingAttendees] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [view, setView] = useState('all');

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

  const totalCapacity = useMemo(
    () => events.reduce((sum, event) => sum + Number(event.capacity || 0), 0),
    [events]
  );

  const occupancy = totalCapacity > 0
    ? Math.min(Math.round((totalRegistrations / totalCapacity) * 100), 100)
    : 0;

  const filteredEvents = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [...events]
      .filter((event) => {
        const matchesSearch = !normalized || [
          event.title,
          event.description,
          event.location,
          event.category
        ].some((value) => String(value || '').toLowerCase().includes(normalized));

        const matchesCategory = !category || event.category === category;

        const eventDate = new Date(event.date);
        const isUpcoming = !Number.isNaN(eventDate.getTime()) && eventDate >= today;

        const matchesView =
          view === 'all' ||
          (view === 'upcoming' && isUpcoming) ||
          (view === 'past' && !isUpcoming);

        return matchesSearch && matchesCategory && matchesView;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, search, category, view]);

  const handleDelete = async (eventId, eventTitle) => {
    const confirmed = window.confirm(
      `Delete "${eventTitle}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(eventId);
      setError('');

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

  const exportAttendees = (event) => {
    const attendees = attendeeLists[event._id] || [];

    if (!attendees.length) return;

    const escapeCSV = (value) => {
      const text = String(value ?? '');
      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = [
      ['Event', 'Name', 'Email', 'Registration date'],
      ...attendees.map((registration) => [
        event.title,
        registration.user?.name || 'Unknown user',
        registration.user?.email || '',
        registration.registrationDate
          ? new Date(registration.registrationDate).toLocaleString('en-IN')
          : ''
      ])
    ];

    const csv = rows
      .map((row) => row.map(escapeCSV).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `${event.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'event'}-attendees.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setView('all');
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <p className="admin-eyebrow">ADMIN CONTROL CENTER</p>
          <h1>Everything in one place.</h1>
          <p>
            Publish events, update details, remove old listings,
            and see who has registered — without touching the code.
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

        <article className="admin-stat-card admin-stat-highlight">
          <span>REGISTRATIONS</span>
          <strong>{totalRegistrations}</strong>
          <small>{occupancy}% of total capacity filled</small>
          <div className="admin-stat-progress">
            <span style={{ width: `${occupancy}%` }} />
          </div>
        </article>
      </section>

      <section className="admin-content">
        <div className="admin-section-header upgraded">
          <div>
            <p className="admin-eyebrow">EVENT MANAGEMENT</p>
            <h2>All events</h2>
            <p>
              Showing {filteredEvents.length} of {events.length} events
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

        <div className="admin-toolbar">
          <div className="admin-search">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search by event, category or location..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search admin events"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear admin search">
                ×
              </button>
            )}
          </div>

          <select
            className="admin-filter-select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter admin events by category"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <div className="admin-view-tabs" role="tablist" aria-label="Event time filter">
            {[
              ['all', 'All'],
              ['upcoming', 'Upcoming'],
              ['past', 'Past']
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={view === value ? 'active' : ''}
                onClick={() => setView(value)}
                role="tab"
                aria-selected={view === value}
              >
                {label}
              </button>
            ))}
          </div>

          {(search || category || view !== 'all') && (
            <button
              type="button"
              className="admin-clear-filter"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}
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
            <button type="button" onClick={fetchEvents}>Try again</button>
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

        {!loading && !error && events.length > 0 && filteredEvents.length === 0 && (
          <div className="admin-empty admin-filter-empty">
            <div className="admin-empty-icon">⌕</div>
            <h3>No events match these filters</h3>
            <p>Try a different search or clear the filters.</p>
            <button type="button" onClick={clearFilters}>Show all events</button>
          </div>
        )}

        {!loading && !error && filteredEvents.length > 0 && (
          <div className="admin-event-list">
            {filteredEvents.map((event) => {
              const attendees = attendeeLists[event._id] || [];
              const isExpanded = expandedEvent === event._id;
              const registrations = registrationCounts[event._id] ?? 0;
              const eventCapacity = Number(event.capacity || 0);
              const fill = eventCapacity > 0
                ? Math.min(Math.round((registrations / eventCapacity) * 100), 100)
                : 0;

              return (
                <article className="admin-event-card" key={event._id}>
                  <div className="admin-event-info">
                    <div className="admin-event-category">
                      {event.category || 'General'}
                    </div>

                    <h3>{event.title}</h3>

                    <p>{event.description || 'No description available.'}</p>

                    <div className="admin-event-meta">
                      <span>📅 {formatEventDateRange(event.date, event.endDate)}</span>
                      {event.time && <span>🕐 {event.time}</span>}
                      {event.location && <span>📍 {event.location}</span>}
                    </div>
                  </div>

                  <div className="admin-event-side">
                    <strong>{registrationCounts[event._id] ?? '—'}</strong>
                    <span>registered</span>
                    <div className="admin-event-capacity-track">
                      <span style={{ width: `${fill}%` }} />
                    </div>
                    <small>{registrations} / {event.capacity || '—'}</small>
                  </div>

                  <div className="admin-event-actions">
                    <Link to={`/events/${event._id}`} className="admin-action-view">
                      View
                    </Link>
                    <Link to={`/edit-event/${event._id}`} className="admin-action-edit">
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
                      onClick={() => handleDelete(event._id, event.title)}
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

                        <div className="admin-attendees-heading-actions">
                          <button
                            type="button"
                            onClick={() => exportAttendees(event)}
                            disabled={!attendees.length}
                          >
                            ↓ Export CSV
                          </button>
                          <span>{attendees.length} / {event.capacity}</span>
                        </div>
                      </div>

                      {attendees.length === 0 ? (
                        <p className="admin-attendees-empty">
                          No active registrations yet.
                        </p>
                      ) : (
                        <div className="admin-attendees-list">
                          {attendees.map((registration) => (
                            <div className="admin-attendee-row" key={registration._id}>
                              <span className="admin-attendee-avatar">
                                {(registration.user?.name || '?').charAt(0).toUpperCase()}
                              </span>
                              <div>
                                <strong>{registration.user?.name || 'Unknown user'}</strong>
                                <span>{registration.user?.email || 'No email'}</span>
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
