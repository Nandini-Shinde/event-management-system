import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatEventDateRange } from '../utils/eventDate';

const getCategoryClass = (category = '') => {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
};

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const formattedDate = formatEventDateRange(event.date, event.endDate);
  const categoryClass = getCategoryClass(event.category);

  const priceLabel = useMemo(() => {
    const price = Number(event.price || 0);
    return price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`;
  }, [event.price]);

  return (
    <article
      className={`event-card event-card-${categoryClass}`}
      tabIndex="0"
      onKeyDown={(keyboardEvent) => {
        if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
          keyboardEvent.preventDefault();
          navigate(`/events/${event._id}`);
        }
      }}
      aria-label={`View ${event.title}`}
    >
      <div className="event-card-image">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="event-card-placeholder">
            <span>EVENT</span>
            <strong>{event.category || 'Experience'}</strong>
          </div>
        )}

        <div className="event-card-image-shade" />

        <div className="event-card-image-topline">
          <span className="event-card-category">
            {event.category || 'General'}
          </span>

          <span className="event-card-price-pill">
            {priceLabel}
          </span>
        </div>

        <span className="event-card-view-hint">
          Open event <span>↗</span>
        </span>
      </div>

      <div className="event-card-content">
        <div className="event-card-date-line">
          <span className="event-card-date-mark">◷</span>
          <span>{formattedDate}</span>
        </div>

        <h3 className="event-card-title">{event.title}</h3>

        <p className="event-card-description">
          {event.description || 'A curated EventHub experience worth discovering.'}
        </p>

        <div className="event-card-meta-list">
          {event.time && (
            <span>
              <b>TIME</b> {event.time}
            </span>
          )}

          {event.location && (
            <span>
              <b>WHERE</b> {event.location}
            </span>
          )}
        </div>

        <button
          type="button"
          className="event-card-button"
          onClick={(eventClick) => {
            eventClick.stopPropagation();
            navigate(`/events/${event._id}`);
          }}
        >
          View details
          <span>→</span>
        </button>
      </div>
    </article>
  );
};

export default EventCard;
