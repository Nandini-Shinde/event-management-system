const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },

    registrationDate: {
      type: Date,
      default: Date.now
    },

    status: {
      type: String,
      enum: ['registered', 'cancelled'],
      default: 'registered'
    }
  },
  {
    timestamps: true
  }
);

// Only one ACTIVE registration per user/event.
// Cancelled registrations do not block re-registration.
registrationSchema.index(
  { user: 1, event: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: 'registered'
    }
  }
);

module.exports = mongoose.model('Registration', registrationSchema);