import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

const MyRegistrations = () => {
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiClient.get('/registrations/my');

      setRegistrations(
        response.data.registrations || []
      );
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

  const handleCancel = async (registrationId) => {
    try {
      setCancellingId(registrationId);

      await apiClient.delete(
        `/registrations/${registrationId}`
      );

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

  if (loading) {
    return (
      <div className="registrations-page">
        <div className="registrations-hero">
          <p className="section-eyebrow">YOUR EXPERIENCES</p>
          <h1>My Registrations</h1>
        </div>

        <div className="registrations-state">
          <div className="loading-dot"></div>
          <p>Loading your registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="registrations-page">

      <section className="registrations-hero">
        <p className="section-eyebrow">
          YOUR EXPERIENCES
        </p>

        <h1>My Registrations</h1>

        <p>
          Keep track of the events you've joined.
        </p>
      </section>

      <section className="registrations-content">

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {registrations.length === 0 ? (
          <div className="registrations-empty">
            <div className="registrations-empty-icon">
              ✦
            </div>

            <h2>No registrations yet</h2>

            <p>
              You haven't registered for any events.
              Discover something worth experiencing.
            </p>

            <button
              onClick={() => navigate('/events')}
            >
              Explore Events →
            </button>
          </div>
        ) : (
          <div className="registrations-grid">

            {registrations.map((registration) => {
              const event = registration.event;

              if (!event) return null;

              const formattedDate =
                new Date(event.date).toLocaleDateString(
                  'en-IN',
                  {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }
                );

              const isActive =
                registration.status === 'registered';

              return (
                <article
                  key={registration._id}
                  className="registration-card"
                >

                  <div className="registration-card-image">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.title}
                      />
                    ) : (
                      <div>
                        EVENT
                      </div>
                    )}
                  </div>

                  <div className="registration-card-body">

                    <div className="registration-card-top">
                      <span className="event-card-category">
                        {event.category}
                      </span>

                      <span
                        className={
                          isActive
                            ? 'registration-status active'
                            : 'registration-status cancelled'
                        }
                      >
                        {registration.status}
                      </span>
                    </div>

                    <h2>{event.title}</h2>

                    <p>📅 {formattedDate}</p>

                    <p>🕒 {event.time}</p>

                    <p>📍 {event.location}</p>

                    <p>
                      {event.price === 0
                        ? 'Free'
                        : `₹${event.price}`}
                    </p>

                    <div className="registration-actions">

                      <button
                        className="registration-view-button"
                        onClick={() =>
                          navigate(
                            `/events/${event._id}`
                          )
                        }
                      >
                        View Event
                      </button>

                      {isActive && (
                        <button
                          className="registration-cancel-button"
                          disabled={
                            cancellingId ===
                            registration._id
                          }
                          onClick={() =>
                            handleCancel(
                              registration._id
                            )
                          }
                        >
                          {cancellingId ===
                          registration._id
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

      </section>

    </div>
  );
};

export default MyRegistrations;