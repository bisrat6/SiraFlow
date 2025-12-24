const { validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const { sendContactConfirmation, sendContactReply } = require('../services/emailService');

// Submit contact form (public)
const submitContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, subject, message } = req.body;

    const contact = new Contact({
      name,
      email,
      subject,
      message,
      status: 'new'
    });

    await contact.save();

    // Send confirmation email (non-blocking)
    sendContactConfirmation({
      to: email,
      name,
      subject
    }).catch(err => console.error('Email notification failed:', err.message));

    res.status(201).json({
      message: 'Message sent successfully! We\'ll get back to you within 24 hours.',
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject
      }
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Get all contacts (SuperAdmin only)
const getAllContacts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }

    const contacts = await Contact.find(query)
      .populate('readBy', 'name email')
      .populate('reply.repliedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Contact.countDocuments(query);

    res.json({
      contacts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single contact (SuperAdmin only)
const getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('readBy', 'name email')
      .populate('reply.repliedBy', 'name email');

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    // Mark as read if not already
    if (!contact.readAt) {
      contact.readAt = new Date();
      contact.readBy = req.user._id;
      contact.status = 'read';
      await contact.save();
    }

    res.json({ contact });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reply to contact (SuperAdmin only)
const replyToContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    contact.reply = {
      message,
      repliedBy: req.user._id,
      repliedAt: new Date()
    };
    contact.status = 'replied';

    await contact.save();

    // Send reply email to the user (non-blocking)
    sendContactReply({
      to: contact.email,
      name: contact.name,
      originalMessage: contact.message,
      replyMessage: message
    }).catch(err => console.error('Failed to send reply email:', err.message));

    res.json({
      message: 'Reply sent successfully! Email notification has been sent to the user.',
      contact
    });
  } catch (error) {
    console.error('Reply to contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update contact status (SuperAdmin only)
const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    contact.status = status;
    await contact.save();

    res.json({
      message: 'Contact status updated',
      contact
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete contact (SuperAdmin only)
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get contact stats (SuperAdmin only)
const getContactStats = async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const newMessages = await Contact.countDocuments({ status: 'new' });
    const read = await Contact.countDocuments({ status: 'read' });
    const replied = await Contact.countDocuments({ status: 'replied' });
    const archived = await Contact.countDocuments({ status: 'archived' });

    res.json({
      stats: {
        total,
        new: newMessages,
        read,
        replied,
        archived
      }
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitContact,
  getAllContacts,
  getContact,
  replyToContact,
  updateContactStatus,
  deleteContact,
  getContactStats
};

