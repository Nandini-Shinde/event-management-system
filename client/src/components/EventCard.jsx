import { useNavigate } from 'react-router-dom';
import { formatEventDateRange } from '../utils/eventDate';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const formattedDate = formatEventDateRange(event.date, event.endDate);

  return (
    <article className="event-card">
      <div className="event-card-image">
        {event.image ? (
          <img src={event.image} alt={event.title} />
        ) : (
          <div className="event-card-placeholder">EVENT</div>
        )}
      </div>

      <div className="event-card-content">
        <span className="event-card-category">
          {event.category}
        </span>

        <h3 className="event-card-title">{event.title}</h3>

        <p className="event-card-info">📅 {formattedDate}</p>
        <p className="event-card-info">🕒 {event.time}</p>
        <p className="event-card-info">📍 {event.location}</p>

        <p className="event-card-price">
          {event.price === 0 ? 'Free' : `₹${event.price}`}
        </p>

        <button
          className="event-card-button"
          onClick={() => navigate(`/events/${event._id}`)}
        >
          View Details →
        </button>
      </div>
    </article>
  );
};

export default EventCard;
