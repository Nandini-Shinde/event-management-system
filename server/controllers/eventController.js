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
        .sort({ createdAt: -1 })
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
      time,
      location,
      capacity,
      price,
      image
    } = req.body;

    const event = await Event.create({
      title,
      description,
      category,
      date,
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

    const isOwner =
      event.organizer.toString() === req.user._id.toString();

    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this event'
      });
    }

    const allowedFields = [
      'title',
      'description',
      'category',
      'date',
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

    const isOwner =
      event.organizer.toString() === req.user._id.toString();

    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this event'
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