const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

const eventFields = 'title description category date endDate time location capacity price image';

const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const existingRegistration = await Registration.findOne({
      user: userId,
      event: eventId
    });

    if (
      existingRegistration &&
      existingRegistration.status === 'registered'
    ) {
      return res.status(409).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    const registeredCount = await Registration.countDocuments({
      event: eventId,
      status: 'registered'
    });

    if (registeredCount >= event.capacity) {
      return res.status(409).json({
        success: false,
        message: 'Event capacity has been reached'
      });
    }

    let registration;

    if (
      existingRegistration &&
      existingRegistration.status === 'cancelled'
    ) {
      existingRegistration.status = 'registered';
      existingRegistration.registrationDate = new Date();
      registration = await existingRegistration.save();
    } else {
      registration = await Registration.create({
        user: userId,
        event: eventId
      });
    }

    const populatedRegistration = await Registration.findById(
      registration._id
    )
      .populate('user', 'name email')
      .populate('event', eventFields);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      registration: populatedRegistration
    });
  } catch (error) {
    console.error('Register for event error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to register for event'
    });
  }
};

const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      user: req.user._id
    })
      .populate('user', 'name email')
      .populate('event', eventFields)
      .sort({ registrationDate: -1 });

    return res.status(200).json({
      success: true,
      registrations
    });
  } catch (error) {
    console.error('Get my registrations error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations'
    });
  }
};

const cancelRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;

    if (!mongoose.isValidObjectId(registrationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration ID'
      });
    }

    const registration = await Registration.findById(registrationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    if (registration.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own registration'
      });
    }

    if (registration.status === 'cancelled') {
      return res.status(409).json({
        success: false,
        message: 'Registration is already cancelled'
      });
    }

    registration.status = 'cancelled';
    await registration.save();

    const populatedRegistration = await Registration.findById(
      registration._id
    )
      .populate('user', 'name email')
      .populate('event', eventFields);

    return res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully',
      registration: populatedRegistration
    });
  } catch (error) {
    console.error('Cancel registration error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to cancel registration'
    });
  }
};

const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const registrations = await Registration.find({
      event: eventId,
      status: 'registered'
    })
      .populate('user', 'name email')
      .sort({ registrationDate: -1 });

    return res.status(200).json({
      success: true,
      event: {
        _id: event._id,
        title: event.title,
        capacity: event.capacity
      },
      registrations
    });
  } catch (error) {
    console.error('Get event registrations error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch event registrations'
    });
  }
};

module.exports = {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  getEventRegistrations
};
