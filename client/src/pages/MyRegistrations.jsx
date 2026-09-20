import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { formatEventDateRange } from '../utils/eventDate';

const MyRegistrations = () => {
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiClient.get('/registrations/my');
      setRegistrations(response.data.registrations || []);
    } catch (err) {
      console.error('Registrations error:', err);

      setError(
        err.response?.data?.message ||
          'Unable to load your registrations.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancel = async (registrationId, eventTitle) => {
    const confirmed = window.confirm(
      `Cancel your registration for "${eventTitle}"?`
    );

    if (!confirmed) return;

    try {
      setCancellingId(registrationId);
      setError('');

      await apiClient.delete(`/registrations/${registrationId}`);
      await fetchRegistrations();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to cancel registration.'
      );
    } finally {
      setCancellingId(null);
    }
  };

  const formatRegistrationDate = (date) => {
    if (!date) return '';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const activeRegistrations = registrations.filter(
    (registration) => registration.status === 'registered'
  );

  const cancelledRegistrations = registrations.filter(
    (registration) => registration.status === 'cancelled'
  );

  const visibleRegistrations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return registrations.filter((registration) => {
      const event = registration.event;
      if (!event) return false;

      const matchesFilter =
        filter === 'all' || registration.status === filter;

      const matchesSearch =
        !normalizedSearch ||
        event.title?.toLowerCase().includes(normalizedSearch) ||
        event.category?.toLowerCase().includes(normalizedSearch) ||
        event.location?.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [registrations, filter, search]);

  if (loading) {
    return (
      <div className="registrations-page">
        <section className="registrations-hero">
          <div>
            <p className="section-eyebrow">YOUR EXPERIENCES</p>
            <h1>My Registrations</h1>
            <p>Keep track of the events you've joined.</p>
          </div>
        </section>

        <section className="registrations-content">
          <div className="registrations-loading-grid">
            {[1, 2, 3].map((item) => (
              <div className="registration-skeleton" key={item}>
                <div className="registration-skeleton-image" />
                <div className="registration-skeleton-content">
                  <div className="registration-skeleton-line small" />
                  <div className="registration-skeleton-line title" />
                  <div className="registration-skeleton-line" />
                  <div className="registration-skeleton-line" />
                  <div className="registration-skeleton-button" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="registrations-page">
      <section className="registrations-hero">
        <div className="registrations-hero-copy">
          <p className="section-eyebrow">YOUR EXPERIENCES</p>
          <h1>My Registrations</h1>
          <p>
            Keep track of the events you've joined, revisit the details,
            or cancel a registration when plans change.
          </p>
        </div>

        <div className="registrations-summary">
          <div className="registration-stat">
            <strong>{registrations.length}</strong>
            <span>Total</span>
          </div>
          <div className="registration-stat">
            <strong>{activeRegistrations.length}</strong>
            <span>Active</span>
          </div>
          <div className="registration-stat">
            <strong>{cancelledRegistrations.length}</strong>
            <span>Cancelled</span>
          </div>
        </div>
      </section>

      <section className="registrations-content">
        {error && (
          <div className="registrations-error">
            <div>
              <strong>Something went wrong.</strong>
              <p>{error}</p>
            </div>
            <button type="button" onClick={fetchRegistrations}>
              Try again
            </button>
          </div>
        )}

        {registrations.length === 0 ? (
          <div className="registrations-empty">
            <div className="registrations-empty-icon">✦</div>
            <p className="registrations-empty-label">NOTHING HERE YET</p>
            <h2>
              Your next experience
              <br />
              starts here.
            </h2>
            <p className="registrations-empty-description">
              You haven't registered for any events yet. Explore what's
              happening and find something worth experiencing.
            </p>
            <button type="button" onClick={() => navigate('/events')}>
              Explore Events
              <span>→</span>
            </button>
          </div>
        ) : (
          <div className="registrations-list">
            <div className="registrations-list-header">
              <div>
                <p className="section-eyebrow">YOUR EVENTS</p>
                <h2>Registered events</h2>
              </div>

              <button
                type="button"
                className="registrations-refresh"
                onClick={fetchRegistrations}
              >
                ↻ Refresh
              </button>
            </div>

            <div className="registrations-toolbar">
              <div className="registration-filter-tabs" role="tablist" aria-label="Filter registrations">
                {[
                  ['all', 'All', registrations.length],
                  ['registered', 'Active', activeRegistrations.length],
                  ['cancelled', 'Cancelled', cancelledRegistrations.length]
                ].map(([value, label, count]) => (
                  <button
                    type="button"
                    key={value}
                    className={filter === value ? 'active' : ''}
                    onClick={() => setFilter(value)}
                    role="tab"
                    aria-selected={filter === value}
                  >
                    {label}
                    <span>{count}</span>
                  </button>
                ))}
              </div>

              <div className="registrations-search">
                <span>⌕</span>
                <input
                  type="search"
                  placeholder="Search your registrations..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search registrations"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Clear registration search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {visibleRegistrations.length === 0 ? (
              <div className="registrations-filter-empty">
                <span>⌕</span>
                <strong>No registrations match this view.</strong>
                <p>Try another filter or clear the search.</p>
                <button
                  type="button"
                  onClick={() => {
                    setFilter('all');
                    setSearch('');
                  }}
                >
                  Show everything
                </button>
              </div>
            ) : (
              <div className="registrations-grid">
                {visibleRegistrations.map((registration) => {
                  const event = registration.event;
                  if (!event) return null;

                  const isActive = registration.status === 'registered';

                  return (
                    <article
                      key={registration._id}
                      className={`registration-card ${
                        !isActive ? 'registration-card-cancelled' : ''
                      }`}
                    >
                      <div className="registration-card-image">
                        {event.image ? (
                          <img
                            src={event.image}
                            alt={event.title}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="registration-image-placeholder">
                            <span>EVENT</span>
                          </div>
                        )}

                        <span className="registration-image-category">
                          {event.category || 'General'}
                        </span>
                      </div>

                      <div className="registration-card-body">
                        <div className="registration-card-top">
                          <span className={`registration-status ${isActive ? 'active' : 'cancelled'}`}>
                            <span className="status-dot" />
                            {isActive ? 'Registered' : 'Cancelled'}
                          </span>

                          <span className="registration-date">
                            Registered {formatRegistrationDate(registration.createdAt)}
                          </span>
                        </div>

                        <h2>{event.title}</h2>

                        <div className="registration-details">
                          <div>
                            <span className="registration-detail-icon">◷</span>
                            <span>
                              {formatEventDateRange(event.date, event.endDate)}
                              {event.time ? ` · ${event.time}` : ''}
                            </span>
                          </div>

                          <div>
                            <span className="registration-detail-icon">◉</span>
                            <span>{event.location || 'Location unavailable'}</span>
                          </div>

                          <div>
                            <span className="registration-detail-icon">₹</span>
                            <span>
                              {Number(event.price || 0) === 0
                                ? 'Free'
                                : `₹${event.price}`}
                            </span>
                          </div>
                        </div>

                        <div className="registration-actions">
                          <button
                            type="button"
                            className="registration-view-button"
                            onClick={() => navigate(`/events/${event._id}`)}
                          >
                            View Event <span>→</span>
                          </button>

                          {isActive && (
                            <button
                              type="button"
                              className="registration-cancel-button"
                              disabled={cancellingId === registration._id}
                              onClick={() => handleCancel(registration._id, event.title)}
                            >
                              {cancellingId === registration._id
                                ? 'Cancelling...'
                                : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyRegistrations;
