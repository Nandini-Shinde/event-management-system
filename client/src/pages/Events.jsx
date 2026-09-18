import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import apiClient from '../services/api';
import EventCard from '../components/EventCard';

const categories = [
  'Technology',
  'Music',
  'Sports',
  'Workshop',
  'Cultural'
];

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const page = Number(searchParams.get('page') || 1);

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();

      if (trimmed === search) return;

      const next = new URLSearchParams(searchParams);

      if (trimmed) {
        next.set('search', trimmed);
      } else {
        next.delete('search');
      }

      next.set('page', '1');

      setSearchParams(next);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, search, searchParams, setSearchParams]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiClient.get('/events', {
          params: {
            search,
            category,
            page,
            limit: 9
          }
        });

        setEvents(response.data.events || []);

        setPagination(
          response.data.pagination || {
            page: 1,
            limit: 9,
            total: 0,
            totalPages: 0
          }
        );
      } catch (err) {
        console.error('Failed to load events:', err);

        setError(
          err.response?.data?.message ||
            'Unable to load events right now.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [search, category, page]);

  const hasFilters = Boolean(search || category);

  const resultText = useMemo(() => {
    if (loading) return 'Finding experiences for you...';

    if (pagination.total === 0) {
      return hasFilters
        ? 'No events match your current filters.'
        : 'No events are available yet.';
    }

    return `${pagination.total} ${
      pagination.total === 1 ? 'event' : 'events'
    } available`;
  }, [loading, pagination.total, hasFilters]);

  const handleCategoryChange = (event) => {
    const value = event.target.value;

    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set('category', value);
    } else {
      next.delete('category');
    }

    next.set('page', '1');

    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchInput('');
  };

  const changePage = (nextPage) => {
    if (
      nextPage < 1 ||
      nextPage > pagination.totalPages ||
      nextPage === page
    ) {
      return;
    }

    const next = new URLSearchParams(searchParams);
    next.set('page', String(nextPage));

    setSearchParams(next);

    window.scrollTo({
      top: 420,
      behavior: 'smooth'
    });
  };

  const retry = () => {
    setSearchParams(new URLSearchParams(searchParams));
  };

  const visiblePages = useMemo(() => {
    const total = pagination.totalPages;

    if (!total) return [];

    if (total <= 5) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    if (page <= 3) {
      return [1, 2, 3, 4, '...', total];
    }

    if (page >= total - 2) {
      return [
        1,
        '...',
        total - 3,
        total - 2,
        total - 1,
        total
      ];
    }

    return [
      1,
      '...',
      page - 1,
      page,
      page + 1,
      '...',
      total
    ];
  }, [page, pagination.totalPages]);

  return (
    <div className="events-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="events-hero">

        <div className="events-hero-glow" />

        <div className="events-hero-content">

          <p className="events-eyebrow">
            DISCOVER WHAT'S NEXT
          </p>

          <h1>
            Explore experiences
            <br />
            worth showing up for.
          </h1>

          <p>
            Find events that match your interests,
            discover something new, and make your
            next experience count.
          </p>

        </div>

      </section>

      {/* =====================================================
          SEARCH / FILTER PANEL
      ===================================================== */}

      <div className="events-controls-wrap">

        <div className="events-controls">

          <div className="events-search">
            <span aria-hidden="true">⌕</span>

            <input
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Search events, categories or places..."
              aria-label="Search events"
            />
          </div>

          <select
            className="events-category"
            value={category}
            onChange={handleCategoryChange}
            aria-label="Filter events by category"
          >
            <option value="">All categories</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              type="button"
              className="events-clear-button"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}

        </div>

      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="events-content">

        <div className="events-heading">

          <div>
            <p className="section-eyebrow">
              EVENT DISCOVERY
            </p>

            <h2>Find your next experience.</h2>

            <p>{resultText}</p>
          </div>

          {hasFilters && !loading && (
            <div className="events-active-filters">

              {search && (
                <span className="events-filter-chip">
                  Search: "{search}"
                </span>
              )}

              {category && (
                <span className="events-filter-chip">
                  {category}
                </span>
              )}

            </div>
          )}

        </div>

        {/* ERROR */}

        {!loading && error && (
          <div className="events-state events-error-state">

            <div className="events-state-icon">!</div>

            <h3>Something went wrong</h3>

            <p>{error}</p>

            <button
              type="button"
              onClick={retry}
            >
              Try again
            </button>

          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="events-grid">

            {Array.from({ length: 6 }).map((_, index) => (
              <div
                className="event-card event-card-loading"
                key={index}
              >
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

        {/* EMPTY */}

        {!loading &&
          !error &&
          events.length === 0 && (
            <div className="events-state">

              <div className="events-state-icon">
                ✦
              </div>

              <h3>
                {hasFilters
                  ? 'Nothing matched your search'
                  : 'No events yet'}
              </h3>

              <p>
                {hasFilters
                  ? 'Try a different search or remove your filters.'
                  : 'New experiences will appear here soon.'}
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              )}

            </div>
          )}

        {/* RESULTS */}

        {!loading &&
          !error &&
          events.length > 0 && (
            <>
              <div className="events-grid">

                {events.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                  />
                ))}

              </div>

              {/* PAGINATION */}

              {pagination.totalPages > 1 && (
                <div className="events-pagination">

                  <button
                    type="button"
                    onClick={() =>
                      changePage(page - 1)
                    }
                    disabled={page === 1}
                  >
                    ← Previous
                  </button>

                  <div className="events-page-numbers">

                    {visiblePages.map((item, index) =>
                      item === '...' ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="events-page-ellipsis"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          type="button"
                          key={item}
                          className={
                            item === page
                              ? 'active'
                              : ''
                          }
                          onClick={() =>
                            changePage(item)
                          }
                        >
                          {item}
                        </button>
                      )
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      changePage(page + 1)
                    }
                    disabled={
                      page === pagination.totalPages
                    }
                  >
                    Next →
                  </button>

                </div>
              )}

            </>
          )}

      </section>
    </div>
  );
};

export default Events;