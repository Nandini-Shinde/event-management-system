import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../services/api';
import EventLivePreview from '../components/EventLivePreview';

const toDateInput = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().split('T')[0];
};

const EditEvent = () => {
  const { eventId } = useParams();
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiClient.get(`/events/${eventId}`);
      const event = response.data.event;

      if (!event) throw new Error('Event not found.');

      setFormData({
        title: event.title || '',
        description: event.description || '',
        category: event.category || '',
        date: toDateInput(event.date),
        endDate: toDateInput(event.endDate || event.date),
        time: event.time || '',
        location: event.location || '',
        capacity: event.capacity !== undefined ? String(event.capacity) : '',
        price: event.price !== undefined ? String(event.price) : '0',
        image: event.image || ''
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to load this event.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

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
      setSaving(true);

      await apiClient.put(`/events/${eventId}`, {
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
          'Unable to update the event. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page edit-event-page">
        <div className="edit-event-loading">
          <div className="admin-loader" />
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="admin-page edit-event-page">
        <div className="edit-event-error-state">
          <p className="admin-eyebrow">EVENT MANAGEMENT</p>
          <h1>Unable to load event.</h1>
          <p>{error}</p>
          <div className="edit-event-error-actions">
            <button type="button" onClick={fetchEvent}>Try Again</button>
            <Link to="/admin-dashboard">Back to Admin</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page edit-event-page">
      <div className="create-event-header">
        <Link to="/admin-dashboard" className="create-event-back">
          ← Back to Admin
        </Link>

        <p className="admin-eyebrow">EVENT MANAGEMENT</p>
        <h1>Edit your event.</h1>
        <p>
          Update anything that changed. EventHub will use the new
          information everywhere immediately.
        </p>
      </div>

      <div className="event-editor-layout">
      <section className="create-event-card">
        <div className="create-event-card-heading">
          <h2>Event details</h2>
          <p>Fields marked with <span>*</span> are required.</p>
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
                min={formData.date || undefined}
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
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={handleChange}
              />
              <small>Optional. Use a publicly accessible image URL.</small>
            </div>
          </div>

          <div className="create-event-actions">
            <Link to="/admin-dashboard" className="create-event-cancel">
              Cancel
            </Link>

            <button
              type="submit"
              className="create-event-submit"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="auth-spinner" />
                  Saving Changes...
                </>
              ) : (
                <>
                  Save Changes
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <EventLivePreview formData={formData} mode="edit" />
      </div>
    </div>
  );
};

export default EditEvent;
