const mongoose = require('mongoose');

// SOS Request Schema for storing emergency requests
const sosRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  user: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  location: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required']
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    accuracy: {
      type: Number,
      default: null
    }
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'cancelled', 'false_alarm'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'high'
  },
  triggeredBy: {
    type: String,
    enum: ['button', 'voice', 'auto', 'manual'],
    default: 'button'
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot be more than 500 characters'],
    default: 'Emergency SOS activated'
  },
  trustedContactsNotified: [{
    contactId: {
      type: mongoose.Schema.Types.ObjectId
    },
    name: String,
    phone: String,
    email: String,
    notifiedAt: {
      type: Date,
      default: Date.now
    },
    notificationStatus: {
      type: String,
      enum: ['sent', 'delivered', 'failed', 'read'],
      default: 'sent'
    },
    responseReceived: {
      type: Boolean,
      default: false
    }
  }],
  emergencyServicesNotified: {
    type: Boolean,
    default: false
  },
  emergencyServicesContactedAt: Date,
  responseTime: {
    type: Number, // in seconds
    default: null
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: [{
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    deviceInfo: {
      userAgent: String,
      platform: String,
      language: String
    },
    appVersion: String,
    batteryLevel: Number,
    networkType: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
sosRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
sosRequestSchema.index({ userId: 1, createdAt: -1 });
sosRequestSchema.index({ status: 1, createdAt: -1 });
sosRequestSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

// Instance method to mark as resolved
sosRequestSchema.methods.markAsResolved = function(resolvedBy, notes) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.resolvedBy = resolvedBy;
  
  if (notes) {
    this.notes.push({
      addedBy: resolvedBy,
      message: notes,
      timestamp: new Date()
    });
  }
  
  return this.save();
};

// Instance method to add note
sosRequestSchema.methods.addNote = function(addedBy, message) {
  this.notes.push({
    addedBy: addedBy,
    message: message,
    timestamp: new Date()
  });
  return this.save();
};

// Static method to find active SOS requests
sosRequestSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).sort({ createdAt: -1 });
};

// Static method to find SOS requests by user
sosRequestSchema.statics.findByUser = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('resolvedBy', 'name email');
};

module.exports = mongoose.model('SosRequest', sosRequestSchema);
