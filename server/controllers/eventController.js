const mongoose = require('mongoose');
const Event = require('../models/Event');

const getEvents = async (req, res) => {
  try {
    const {
      search = '',
      category,
      page = 1,
      limit = 10
    } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);
    const perPage = Math.min(Math.max(Number(limit) || 10, 1), 50);

    const filter = {};

    if (search.trim()) {
      filter.title = {
        $regex: search.trim(),
        $options: 'i'
      };
    }

    if (category && category.trim()) {
      filter.category = category.trim();
    }

    const skip = (currentPage - 1) * perPage;

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate('organizer', 'name email')
        .sort({ date: 1, createdAt: -1 })
        .skip(skip)
        .limit(perPage),

      Event.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      events,
      pagination: {
        page: currentPage,
        limit: perPage,
        total,
        totalPages: Math.ceil(total / perPage)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const event = await Event.findById(id)
      .populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    return res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Get event error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch event'
    });
  }
};

const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      date,
      endDate,
      time,
      location,
      capacity,
      price,
      image
    } = req.body;

    const startDate = new Date(date);
    const resolvedEndDate = endDate ? new Date(endDate) : startDate;

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(resolvedEndDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid event dates'
      });
    }

    if (resolvedEndDate < startDate) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before the start date'
      });
    }

    const event = await Event.create({
      title,
      description,
      category,
      date: startDate,
      endDate: resolvedEndDate,
      time,
      location,
      capacity,
      price,
      image,
      organizer: req.user._id
    });

    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: populatedEvent
    });
  } catch (error) {
    console.error('Create event error:', error);

    return res.status(400).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const allowedFields = [
      'title',
      'description',
      'category',
      'date',
      'endDate',
      'time',
      'location',
      'capacity',
      'price',
      'image'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    }

    if (!event.endDate) {
      event.endDate = event.date;
    }

    if (event.endDate < event.date) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before the start date'
      });
    }

    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);

    return res.status(400).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    await Event.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete event'
    });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
