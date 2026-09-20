const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters']
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },

    // Start date. Kept as `date` for backwards compatibility with existing events.
    date: {
      type: Date,
      required: [true, 'Date is required']
    },

    // Optional end date for multi-day events.
    endDate: {
      type: Date,
      default: null,
      validate: {
        validator(value) {
          if (!value || !this.date) return true;
          return value >= this.date;
        },
        message: 'End date cannot be before the start date'
      }
    },

    time: {
      type: String,
      required: [true, 'Time is required'],
      trim: true
    },

    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },

    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },

    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },

    image: {
      type: String,
      trim: true,
      default: ''
    },

    // Kept as creator metadata; it is NOT a permission/role concept.
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Event', eventSchema);
