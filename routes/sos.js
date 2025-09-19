const express = require('express');
const { body, validationResult } = require('express-validator');
const SosRequest = require('../models/SosRequest');
const User = require('../models/User');
const { authenticateToken, validateSosOwnership } = require('../middleware/auth');
const { sendNotification } = require('../utils/notifications');

const router = express.Router();

// Validation rules
const sosValidation = [
  body('location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  body('location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required'),
  body('location.address')
    .notEmpty()
    .withMessage('Address is required'),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters')
];

// @route   POST /api/sos/trigger
// @desc    Trigger SOS emergency request
// @access  Private
router.post('/trigger', authenticateToken, sosValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { location, message, triggeredBy = 'button', priority = 'high' } = req.body;
    const userId = req.user._id;

    // Check if user has any active SOS requests
    const activeSos = await SosRequest.findOne({
      userId,
      status: 'active'
    });

    if (activeSos) {
      try {
        await activeSos.markAsResolved(req.user._id, 'Auto-resolved due to new SOS trigger');
        console.log(`Auto-resolved previous active SOS ${activeSos._id} for user ${userId}`);
      } catch (e) {
        console.error('Failed to auto-resolve existing SOS:', e);
      }
    }

    // Create new SOS request
    const sosRequest = new SosRequest({
      userId,
      user: {
        name: req.user.name,
        phone: req.user.phone,
        email: req.user.email
      },
      location,
      message: message || 'Emergency SOS activated',
      triggeredBy,
      priority,
      trustedContactsNotified: []
    });

    await sosRequest.save();

    // Get user's trusted contacts
    const user = await User.findById(userId);
    const trustedContacts = user.trustedContacts || [];

    // Send notifications to trusted contacts
    const notificationPromises = trustedContacts.map(async (contact) => {
      try {
        const notificationData = {
          sosId: sosRequest._id,
          userName: req.user.name,
          userPhone: req.user.phone,
          location: sosRequest.location,
          message: sosRequest.message,
          timestamp: sosRequest.createdAt
        };

        // Send notification (SMS, Email)
        const notificationResult = await sendNotification(contact, notificationData);

        // Additionally, if the contact is a registered user with an fcmToken, send a push notification
        const possibleUser = await User.findOne({
          $or: [
            contact.email ? { email: contact.email.toLowerCase() } : {},
            contact.phone ? { phone: contact.phone } : {}
          ]
        }).select('fcmToken name');

        if (possibleUser && possibleUser.fcmToken) {
          try {
            const pushResult = await require('../utils/notifications').sendPushNotification(
              possibleUser.fcmToken,
              notificationData
            );
            // If push succeeded, consider it part of successful notifications
            if (pushResult.success) {
              notificationResult.success = true;
            }
          } catch (e) {
            // ignore push failure; SMS/Email already attempted
          }
        }
        
        // Update SOS request with notification status
        sosRequest.trustedContactsNotified.push({
          contactId: contact._id,
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          notificationStatus: notificationResult.success ? 'sent' : 'failed'
        });

        return notificationResult;
      } catch (error) {
        console.error(`Failed to notify contact ${contact.name}:`, error);
        
        sosRequest.trustedContactsNotified.push({
          contactId: contact._id,
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          notificationStatus: 'failed'
        });

        return { success: false, error: error.message };
      }
    });

    // Wait for all notifications to be sent to trusted contacts
    await Promise.all(notificationPromises);

    // Broadcast to all registered users (FCM; SMS fallback if configured)
    try {
      const broadcastNotificationData = {
        sosId: sosRequest._id,
        userName: req.user.name,
        userPhone: req.user.phone,
        location: sosRequest.location,
        message: sosRequest.message,
        timestamp: sosRequest.createdAt
      };

      const { broadcastSosToAllUsers } = require('../utils/notifications');
      const broadcastResult = await broadcastSosToAllUsers(broadcastNotificationData);
      console.log('Broadcast summary:', broadcastResult);
    } catch (e) {
      console.error('Broadcast to all users failed:', e);
    }

    await sosRequest.save();

    // Update user's last known location
    await User.findByIdAndUpdate(userId, {
      lastKnownLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        timestamp: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'SOS request triggered successfully',
      data: {
        sosRequest: {
          id: sosRequest._id,
          status: sosRequest.status,
          priority: sosRequest.priority,
          location: sosRequest.location,
          message: sosRequest.message,
          triggeredBy: sosRequest.triggeredBy,
          createdAt: sosRequest.createdAt,
          contactsNotified: sosRequest.trustedContactsNotified.length
        }
      }
    });
  } catch (error) {
    console.error('SOS trigger error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while triggering SOS'
    });
  }
});

// @route   GET /api/sos/active
// @desc    Get active SOS requests for current user
// @access  Private
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const activeSos = await SosRequest.findOne({
      userId: req.user._id,
      status: 'active'
    });

    if (!activeSos) {
      return res.json({
        success: true,
        message: 'No active SOS requests',
        data: { sosRequest: null }
      });
    }

    // Normalize response to always include a stable 'id' field
    const normalized = {
      id: activeSos._id,
      status: activeSos.status,
      priority: activeSos.priority,
      location: activeSos.location,
      message: activeSos.message,
      triggeredBy: activeSos.triggeredBy,
      createdAt: activeSos.createdAt,
      trustedContactsNotified: activeSos.trustedContactsNotified
    };

    res.json({
      success: true,
      data: { sosRequest: normalized }
    });
  } catch (error) {
    console.error('Get active SOS error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching active SOS'
    });
  }
});

// @route   GET /api/sos/history
// @desc    Get SOS request history for current user
// @access  Private
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sosRequests = await SosRequest.findByUser(req.user._id, limit + skip)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await SosRequest.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: {
        sosRequests,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get SOS history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching SOS history'
    });
  }
});

// @route   PUT /api/sos/:id/resolve
// @desc    Resolve an SOS request
// @access  Private
router.put('/:id/resolve', authenticateToken, validateSosOwnership, [
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { notes } = req.body;
    const sosId = req.sosId;

    const sosRequest = await SosRequest.findById(sosId);
    
    if (!sosRequest) {
      return res.status(404).json({
        success: false,
        message: 'SOS request not found'
      });
    }

    if (sosRequest.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to resolve this SOS request'
      });
    }

    if (sosRequest.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'SOS request is not active'
      });
    }

    // Mark as resolved
    await sosRequest.markAsResolved(req.user._id, notes);

    res.json({
      success: true,
      message: 'SOS request resolved successfully',
      data: { sosRequest }
    });
  } catch (error) {
    console.error('Resolve SOS error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resolving SOS'
    });
  }
});

// @route   PUT /api/sos/:id/cancel
// @desc    Cancel an SOS request
// @access  Private
router.put('/:id/cancel', authenticateToken, validateSosOwnership, async (req, res) => {
  try {
    const sosId = req.sosId;

    const sosRequest = await SosRequest.findById(sosId);
    
    if (!sosRequest) {
      return res.status(404).json({
        success: false,
        message: 'SOS request not found'
      });
    }

    if (sosRequest.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this SOS request'
      });
    }

    if (sosRequest.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'SOS request is not active'
      });
    }

    // Mark as cancelled
    sosRequest.status = 'cancelled';
    sosRequest.resolvedAt = new Date();
    await sosRequest.save();

    res.json({
      success: true,
      message: 'SOS request cancelled successfully',
      data: { sosRequest }
    });
  } catch (error) {
    console.error('Cancel SOS error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling SOS'
    });
  }
});

// @route   GET /api/sos/:id
// @desc    Get specific SOS request details
// @access  Private
router.get('/:id', authenticateToken, validateSosOwnership, async (req, res) => {
  try {
    const sosId = req.sosId;

    const sosRequest = await SosRequest.findById(sosId)
      .populate('resolvedBy', 'name email')
      .populate('notes.addedBy', 'name email');
    
    if (!sosRequest) {
      return res.status(404).json({
        success: false,
        message: 'SOS request not found'
      });
    }

    if (sosRequest.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this SOS request'
      });
    }

    res.json({
      success: true,
      data: { sosRequest }
    });
  } catch (error) {
    console.error('Get SOS details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching SOS details'
    });
  }
});

// @route   POST /api/sos/:id/note
// @desc    Add note to SOS request
// @access  Private
router.post('/:id/note', authenticateToken, validateSosOwnership, [
  body('message')
    .notEmpty()
    .isLength({ max: 500 })
    .withMessage('Note message is required and cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { message } = req.body;
    const sosId = req.sosId;

    const sosRequest = await SosRequest.findById(sosId);
    
    if (!sosRequest) {
      return res.status(404).json({
        success: false,
        message: 'SOS request not found'
      });
    }

    if (sosRequest.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add notes to this SOS request'
      });
    }

    // Add note
    await sosRequest.addNote(req.user._id, message);

    res.json({
      success: true,
      message: 'Note added successfully',
      data: { sosRequest }
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding note'
    });
  }
});

module.exports = router;
