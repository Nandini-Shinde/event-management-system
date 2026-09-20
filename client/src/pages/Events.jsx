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

const pageSizes = [9, 18, 27];

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
  const [retryKey, setRetryKey] = useState(0);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 9);

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
    }, 300);

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
            limit: pageSizes.includes(limit) ? limit : 9
          }
        });

        setEvents(response.data.events || []);

        setPagination(
          response.data.pagination || {
            page: 1,
            limit,
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
  }, [search, category, page, limit, retryKey]);

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

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    next.set('page', '1');
    setSearchParams(next);
  };

  const handleCategoryChange = (event) => {
    updateParam('category', event.target.value);
  };

  const handlePageSizeChange = (event) => {
    updateParam('limit', event.target.value === '9' ? '' : event.target.value);
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
      top: 380,
      behavior: 'smooth'
    });
  };

  const retry = () => {
    setRetryKey((current) => current + 1);
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
      <section className="events-hero">
        <div className="events-hero-glow" />
        <div className="events-hero-grid" />

        <div className="events-hero-content">
          <span className="events-hero-badge">
            <span /> Live event discovery
          </span>

          <p className="events-eyebrow">
            DISCOVER WHAT'S NEXT
          </p>

          <h1>
            Explore experiences
            <br />
            worth showing up for.
          </h1>

          <p>
            Search the latest EventHub experiences by name,
            category, or place and find your next reason to go out.
          </p>

          <div className="events-hero-microcopy">
            <span>Fast search</span>
            <span>Live availability</span>
            <span>Instant registration</span>
          </div>
        </div>
      </section>

      <div className="events-controls-wrap">
        <div className="events-controls">
          <div className="events-search">
            <span aria-hidden="true">⌕</span>

            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search events, categories or places..."
              aria-label="Search events"
            />

            {searchInput && (
              <button
                type="button"
                className="events-search-clear"
                onClick={() => setSearchInput('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
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

          <select
            className="events-category events-page-size"
            value={String(pageSizes.includes(limit) ? limit : 9)}
            onChange={handlePageSizeChange}
            aria-label="Events per page"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              type="button"
              className="events-clear-button"
              onClick={clearFilters}
            >
              Clear all
            </button>
          )}
        </div>

        <div className="events-category-chips" aria-label="Quick categories">
          <button
            type="button"
            className={!category ? 'active' : ''}
            onClick={() => updateParam('category', '')}
          >
            All
          </button>

          {categories.map((item) => (
            <button
              type="button"
              key={item}
              className={category === item ? 'active' : ''}
              onClick={() => updateParam('category', item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <section className="events-content">
        <div className="events-heading">
          <div>
            <p className="section-eyebrow">EVENT DISCOVERY</p>
            <h2>Find your next experience.</h2>
            <p>{resultText}</p>
          </div>

          <div className="events-heading-meta">
            {hasFilters && !loading && (
              <div className="events-active-filters">
                {search && (
                  <span className="events-filter-chip">
                    Search: “{search}”
                  </span>
                )}

                {category && (
                  <span className="events-filter-chip">
                    {category}
                  </span>
                )}
              </div>
            )}

            {!loading && pagination.total > 0 && (
              <span className="events-page-indicator">
                Page {page} of {pagination.totalPages}
              </span>
            )}
          </div>
        </div>

        {loading && (
          <div className="events-grid">
            {Array.from({ length: limit }, (_, index) => (
              <div className="event-card event-card-loading" key={index}>
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

        {!loading && error && (
          <div className="events-state events-state-upgraded">
            <div className="events-state-icon">!</div>
            <p className="section-eyebrow">TEMPORARILY UNAVAILABLE</p>
            <h3>We couldn't load the event library.</h3>
            <p>{error}</p>
            <button type="button" onClick={retry}>
              Try again <span>→</span>
            </button>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="events-state events-empty-upgraded">
            <div className="events-state-icon">⌕</div>
            <p className="section-eyebrow">NOTHING FOUND</p>
            <h3>
              {hasFilters
                ? 'No experiences match those filters.'
                : 'There are no published events yet.'}
            </h3>
            <p>
              {hasFilters
                ? 'Try a different search term or clear your filters to see everything.'
                : 'Check back soon for the next EventHub experience.'}
            </p>
            {hasFilters && (
              <button type="button" onClick={clearFilters}>
                Clear filters <span>→</span>
              </button>
            )}
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="events-grid">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}

        {!loading && !error && pagination.totalPages > 1 && (
          <div className="events-pagination">
            <button
              type="button"
              onClick={() => changePage(page - 1)}
              disabled={page <= 1}
            >
              ←
            </button>

            {visiblePages.map((item, index) => (
              item === '...' ? (
                <span key={`ellipsis-${index}`} className="events-pagination-ellipsis">
                  …
                </span>
              ) : (
                <button
                  type="button"
                  key={item}
                  className={item === page ? 'active' : ''}
                  onClick={() => changePage(item)}
                >
                  {item}
                </button>
              )
            ))}

            <button
              type="button"
              onClick={() => changePage(page + 1)}
              disabled={page >= pagination.totalPages}
            >
              →
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Events;
