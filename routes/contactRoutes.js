const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireSuperAdmin } = require('../middleware/subscriptionMiddleware');
const {
  submitContact,
  getAllContacts,
  getContact,
  replyToContact,
  updateContactStatus,
  deleteContact,
  getContactStats
} = require('../controllers/contactController');

// Public route - submit contact form
router.post('/submit', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required')
], submitContact);

// Protected routes - SuperAdmin only
router.use(authMiddleware);
router.use(requireSuperAdmin);

router.get('/', getAllContacts);
router.get('/stats', getContactStats);
router.get('/:id', getContact);
router.post('/:id/reply', [
  body('message').trim().notEmpty().withMessage('Reply message is required')
], replyToContact);
router.patch('/:id/status', [
  body('status').isIn(['new', 'read', 'replied', 'archived']).withMessage('Invalid status')
], updateContactStatus);
router.delete('/:id', deleteContact);

module.exports = router;

