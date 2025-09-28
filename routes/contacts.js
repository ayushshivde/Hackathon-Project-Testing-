const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Contact name must be between 2 and 50 characters'),
  body('phone')
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('relationship')
    .optional()
    .isIn(['family', 'friend', 'colleague', 'neighbor', 'other'])
    .withMessage('Invalid relationship type')
];

// @route   GET /api/contacts
// @desc    Get all trusted contacts for current user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        contacts: user.trustedContacts || []
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contacts'
    });
  }
});

// @route   POST /api/contacts
// @desc    Add a new trusted contact
// @access  Private
router.post('/', authenticateToken, contactValidation, async (req, res) => {
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

    const { name, phone, email, relationship = 'friend', isPrimary = false } = req.body;

    // Check if contact with same phone already exists
    const user = await User.findById(req.user._id);
    const existingContact = user.trustedContacts.find(
      contact => contact.phone === phone
    );

    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: 'Contact with this phone number already exists'
      });
    }

    // If this is set as primary, unset other primary contacts
    if (isPrimary) {
      user.trustedContacts.forEach(contact => {
        contact.isPrimary = false;
      });
    }

    // Create new contact
    const newContact = {
      name,
      phone,
      email,
      relationship,
      isPrimary
    };

    user.trustedContacts.push(newContact);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Contact added successfully',
      data: {
        contact: newContact
      }
    });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding contact'
    });
  }
});

// @route   PUT /api/contacts/:contactId
// @desc    Update a trusted contact
// @access  Private
router.put('/:contactId', authenticateToken, contactValidation, async (req, res) => {
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

    const { contactId } = req.params;
    const { name, phone, email, relationship, isPrimary } = req.body;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the contact
    const contact = user.trustedContacts.id(contactId);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Check if phone number is being changed and if it conflicts with existing contacts
    if (phone && phone !== contact.phone) {
      const existingContact = user.trustedContacts.find(
        c => c.phone === phone && c._id.toString() !== contactId
      );

      if (existingContact) {
        return res.status(400).json({
          success: false,
          message: 'Another contact with this phone number already exists'
        });
      }
    }

    // If this is set as primary, unset other primary contacts
    if (isPrimary) {
      user.trustedContacts.forEach(c => {
        if (c._id.toString() !== contactId) {
          c.isPrimary = false;
        }
      });
    }

    // Update contact fields
    if (name) contact.name = name;
    if (phone) contact.phone = phone;
    if (email !== undefined) contact.email = email;
    if (relationship) contact.relationship = relationship;
    if (isPrimary !== undefined) contact.isPrimary = isPrimary;

    await user.save();

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: {
        contact
      }
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating contact'
    });
  }
});

// @route   DELETE /api/contacts/:contactId
// @desc    Delete a trusted contact
// @access  Private
router.delete('/:contactId', authenticateToken, async (req, res) => {
  try {
    const { contactId } = req.params;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the contact index
    const contactIndex = user.trustedContacts.findIndex(contact => contact._id.toString() === contactId);
    
    if (contactIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Remove the contact from the array
    user.trustedContacts.splice(contactIndex, 1);
    await user.save();

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting contact'
    });
  }
});

// @route   PUT /api/contacts/:contactId/primary
// @desc    Set a contact as primary
// @access  Private
router.put('/:contactId/primary', authenticateToken, async (req, res) => {
  try {
    const { contactId } = req.params;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the contact
    const contact = user.trustedContacts.id(contactId);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Unset all other primary contacts
    user.trustedContacts.forEach(c => {
      c.isPrimary = false;
    });

    // Set this contact as primary
    contact.isPrimary = true;
    await user.save();

    res.json({
      success: true,
      message: 'Contact set as primary successfully',
      data: {
        contact
      }
    });
  } catch (error) {
    console.error('Set primary contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while setting primary contact'
    });
  }
});

// @route   GET /api/contacts/primary
// @desc    Get primary trusted contact
// @access  Private
router.get('/primary', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const primaryContact = user.trustedContacts.find(contact => contact.isPrimary);

    res.json({
      success: true,
      data: {
        primaryContact: primaryContact || null
      }
    });
  } catch (error) {
    console.error('Get primary contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching primary contact'
    });
  }
});

// @route   POST /api/contacts/import
// @desc    Import contacts from device (bulk import)
// @access  Private
router.post('/import', authenticateToken, [
  body('contacts')
    .isArray({ min: 1 })
    .withMessage('Contacts array is required'),
  body('contacts.*.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Each contact must have a valid name'),
  body('contacts.*.phone')
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Each contact must have a valid phone number')
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

    const { contacts } = req.body;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const importedContacts = [];
    const skippedContacts = [];

    for (const contactData of contacts) {
      const { name, phone, email, relationship = 'friend' } = contactData;

      // Check if contact already exists
      const existingContact = user.trustedContacts.find(
        c => c.phone === phone
      );

      if (existingContact) {
        skippedContacts.push({
          name,
          phone,
          reason: 'Contact already exists'
        });
        continue;
      }

      // Add new contact
      const newContact = {
        name,
        phone,
        email,
        relationship,
        isPrimary: false
      };

      user.trustedContacts.push(newContact);
      importedContacts.push(newContact);
    }

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Contacts imported successfully',
      data: {
        imported: importedContacts,
        skipped: skippedContacts,
        totalImported: importedContacts.length,
        totalSkipped: skippedContacts.length
      }
    });
  } catch (error) {
    console.error('Import contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while importing contacts'
    });
  }
});

module.exports = router;
