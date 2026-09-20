import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import EventLivePreview from '../components/EventLivePreview';

const todayString = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  return new Date(today.getTime() - offset * 60 * 1000)
    .toISOString()
    .split('T')[0];
};

const CreateEvent = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    endDate: '',
    time: '',
    location: '',
    capacity: '',
    price: '0',
    image: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => {
      const next = { ...current, [name]: value };

      if (name === 'date' && (!current.endDate || current.endDate < value)) {
        next.endDate = value;
      }

      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const required = [
      'title',
      'description',
      'category',
      'date',
      'endDate',
      'time',
      'location',
      'capacity'
    ];

    if (required.some((field) => !String(formData[field]).trim())) {
      setError('Please complete all required fields.');
      return;
    }

    if (formData.endDate < formData.date) {
      setError('End date cannot be before the start date.');
      return;
    }

    if (Number(formData.capacity) <= 0) {
      setError('Capacity must be greater than 0.');
      return;
    }

    if (Number(formData.price || 0) < 0) {
      setError('Price cannot be negative.');
      return;
    }

    try {
      setLoading(true);

      await apiClient.post('/events', {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        date: formData.date,
        endDate: formData.endDate,
        time: formData.time,
        location: formData.location.trim(),
        capacity: Number(formData.capacity),
        price: Number(formData.price || 0),
        image: formData.image.trim()
      });

      navigate('/admin-dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to create the event. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page create-event-page">
      <div className="create-event-header">
        <Link to="/admin-dashboard" className="create-event-back">
          ← Back to Admin
        </Link>

        <p className="admin-eyebrow">EVENT MANAGEMENT</p>
        <h1>Create an event.</h1>
        <p>
          Add the event once. EventHub takes care of showing it
          across discovery, details, and registration pages.
        </p>
      </div>

      <div className="event-editor-layout">
      <section className="create-event-card">
        <div className="create-event-card-heading">
          <h2>Event details</h2>
          <p>
            Fields marked with <span>*</span> are required.
          </p>
        </div>

        {error && <div className="create-event-error">{error}</div>}

        <form className="create-event-form" onSubmit={handleSubmit}>
          <div className="create-event-grid">
            <div className="create-event-field full-width">
              <label htmlFor="title">Event title <span>*</span></label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Tulsi Mahotsav"
                value={formData.title}
                onChange={handleChange}
                maxLength={120}
              />
            </div>

            <div className="create-event-field full-width">
              <label htmlFor="description">Description <span>*</span></label>
              <textarea
                id="description"
                name="description"
                rows="5"
                placeholder="Tell people what this event is about..."
                value={formData.description}
                onChange={handleChange}
                maxLength={1200}
              />
            </div>

            <div className="create-event-field">
              <label htmlFor="category">Category <span>*</span></label>
              <input
                id="category"
                name="category"
                type="text"
                placeholder="e.g. Cultural"
                value={formData.category}
                onChange={handleChange}
              />
            </div>

            <div className="create-event-field">
              <label htmlFor="location">Location <span>*</span></label>
              <input
                id="location"
                name="location"
                type="text"
                placeholder="e.g. Main Auditorium"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="create-event-field">
              <label htmlFor="date">Start date <span>*</span></label>
              <input
                id="date"
                name="date"
                type="date"
                min={todayString()}
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <div className="create-event-field">
              <label htmlFor="endDate">End date <span>*</span></label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                min={formData.date || todayString()}
                value={formData.endDate}
                onChange={handleChange}
              />
              <small>Use the same date for a one-day event.</small>
            </div>

            <div className="create-event-field">
              <label htmlFor="time">Time <span>*</span></label>
              <input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
              />
            </div>

            <div className="create-event-field">
              <label htmlFor="capacity">Capacity <span>*</span></label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                placeholder="e.g. 200"
                value={formData.capacity}
                onChange={handleChange}
              />
            </div>

            <div className="create-event-field">
              <label htmlFor="price">Price</label>
              <div className="create-event-input-prefix">
                <span>₹</span>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
              <small>Leave as 0 for a free event.</small>
            </div>

            <div className="create-event-field full-width">
              <label htmlFor="image">Image URL</label>
              <input
                id="image"
                name="image"
                type="url"
                placeholder="https://example.com/event-image.jpg"
                value={formData.image}
                onChange={handleChange}
              />
              <small>Optional. Add a publicly accessible image URL.</small>
            </div>
          </div>

          <div className="create-event-actions">
            <Link to="/admin-dashboard" className="create-event-cancel">
              Cancel
            </Link>

            <button
              type="submit"
              className="create-event-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Publishing...
                </>
              ) : (
                <>
                  Publish Event
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <EventLivePreview formData={formData} mode="create" />
      </div>
    </div>
  );
};

export default CreateEvent;
