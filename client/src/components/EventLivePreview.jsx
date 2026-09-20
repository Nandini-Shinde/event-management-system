import { formatEventDateRange } from '../utils/eventDate';

const EventLivePreview = ({ formData, mode = 'create' }) => {
  const dateLabel = formData.date
    ? formatEventDateRange(formData.date, formData.endDate || formData.date)
    : 'Your event date';

  const price = Number(formData.price || 0);
  const priceLabel = price > 0
    ? `₹${price.toLocaleString('en-IN')}`
    : 'Free';

  return (
    <aside className="event-live-preview" aria-label="Live event preview">
      <div className="event-live-preview-head">
        <div>
          <p className="event-live-preview-kicker">LIVE PREVIEW</p>
          <h3>How it will look</h3>
        </div>
        <span>{mode === 'edit' ? 'Editing' : 'Drafting'}</span>
      </div>

      <div className="event-preview-card">
        <div className="event-preview-card-media">
          {formData.image ? (
            <img src={formData.image} alt="" />
          ) : (
            <div className="event-preview-card-placeholder">
              <span>EVENTHUB</span>
            </div>
          )}

          <div className="event-preview-card-overlay" />

          <div className="event-preview-card-badges">
            <span>{formData.category || 'Category'}</span>
            <strong>{priceLabel}</strong>
          </div>
        </div>

        <div className="event-preview-card-body">
          <div className="event-preview-date">
            ◷ {dateLabel}
          </div>

          <h4>{formData.title.trim() || 'Your event title'}</h4>

          <p>
            {formData.description.trim() ||
              'A short description of your event will appear here.'}
          </p>

          <div className="event-preview-card-meta">
            <span>◷ {formData.time || 'Time TBA'}</span>
            <span>◉ {formData.location.trim() || 'Location TBA'}</span>
          </div>
        </div>
      </div>

      <p className="event-live-preview-note">
        This preview updates as you type. The published page uses the same event data.
      </p>
    </aside>
  );
};

export default EventLivePreview;
