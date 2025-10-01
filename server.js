const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const sosRoutes = require('./routes/sos');
const contactsRoutes = require('./routes/contacts');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: [
        "'self'",
        "https://maps.googleapis.com",
        // Firebase SDK for service worker importScripts
        "https://www.gstatic.com",
        "https://www.gstatic.com/firebasejs"
      ],
      connectSrc: [
        "'self'",
        "https://maps.googleapis.com",
        // FCM/Web Push endpoints
        "https://fcmregistrations.googleapis.com",
        "https://fcm.googleapis.com",
        "https://www.googleapis.com",
        "https://firebaseinstallations.googleapis.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://maps.gstatic.com",
        "https://maps.googleapis.com",
        "https://www.gstatic.com",
        // ImageKit CDN
        (process.env.IMAGEKIT_URL_ENDPOINT ? new URL(process.env.IMAGEKIT_URL_ENDPOINT).origin : 'https://ik.imagekit.io')
      ],
      frameSrc: ["'self'", "https://www.google.com"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all requests
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow production domains
    const allowedOrigins = [
      
      'https://hackathon-project-testing.vercel.app'
      // 'http://localhost:3000/',
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static serving for uploaded files (avatars)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Navi Shakti API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/contacts', contactsRoutes);

// Free geocoding API endpoint using OpenStreetMap Nominatim
app.get('/api/maps/geocode', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Try multiple free geocoding services for better reliability
    const geocodingResults = await Promise.allSettled([
      // Primary: OpenStreetMap Nominatim (completely free)
      geocodeWithNominatim(lat, lng),
      // Fallback: LocationIQ (free tier: 5,000 requests/day)
      geocodeWithLocationIQ(lat, lng),
      // Fallback: MapBox (free tier: 100,000 requests/month)
      geocodeWithMapBox(lat, lng)
    ]);

    // Find the first successful result
    let successfulResult = null;
    for (const result of geocodingResults) {
      if (result.status === 'fulfilled' && result.value) {
        successfulResult = result.value;
        break;
      }
    }

    if (successfulResult) {
      res.json({
        success: true,
        data: {
          address: successfulResult.address,
          location: {
            latitude: parseFloat(lat),
            longitude: parseFloat(lng)
          }
        }
      });
    } else {
      // If all geocoding services fail, return coordinates as fallback
      res.json({
        success: true,
        data: {
          address: `${lat}, ${lng}`,
          location: {
            latitude: parseFloat(lat),
            longitude: parseFloat(lng)
          }
        }
      });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during geocoding'
    });
  }
});

// OpenStreetMap Nominatim geocoding (completely free)
// Note: Nominatim has a usage policy - max 1 request per second
let lastNominatimRequest = 0;
const NOMINATIM_RATE_LIMIT = 1000; // 1 second in milliseconds

async function geocodeWithNominatim(lat, lng) {
  try {
    // Rate limiting for Nominatim
    const now = Date.now();
    const timeSinceLastRequest = now - lastNominatimRequest;
    
    if (timeSinceLastRequest < NOMINATIM_RATE_LIMIT) {
      await new Promise(resolve => setTimeout(resolve, NOMINATIM_RATE_LIMIT - timeSinceLastRequest));
    }
    
    lastNominatimRequest = Date.now();
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
      {
        headers: {
          'User-Agent': 'NaviShakti-SafetyApp/1.0'
        }
      }
    );
    
    const data = await response.json();
    
    if (data && data.display_name) {
      return {
        address: data.display_name,
        source: 'nominatim'
      };
    }
    return null;
  } catch (error) {
    console.error('Nominatim geocoding error:', error);
    return null;
  }
}

// LocationIQ geocoding (free tier: 5,000 requests/day)
async function geocodeWithLocationIQ(lat, lng) {
  try {
    const apiKey = process.env.LOCATIONIQ_API_KEY;
    if (!apiKey) return null;

    const response = await fetch(
      `https://us1.locationiq.com/v1/reverse?key=${apiKey}&lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=en`
    );
    
    const data = await response.json();
    
    if (data && data.display_name) {
      return {
        address: data.display_name,
        source: 'locationiq'
      };
    }
    return null;
  } catch (error) {
    console.error('LocationIQ geocoding error:', error);
    return null;
  }
}

// MapBox geocoding (free tier: 100,000 requests/month)
async function geocodeWithMapBox(lat, lng) {
  try {
    const apiKey = process.env.MAPBOX_ACCESS_TOKEN;
    if (!apiKey) return null;

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${apiKey}&types=address,poi`
    );
    
    const data = await response.json();
    
    if (data && data.features && data.features.length > 0) {
      return {
        address: data.features[0].place_name,
        source: 'mapbox'
      };
    }
    return null;
  } catch (error) {
    console.error('MapBox geocoding error:', error);
    return null;
  }
}

// Test notification endpoint (for debugging)
app.post('/api/test-notification', async (req, res) => {
  try {
    const { fcmToken } = req.body;
    
    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required'
      });
    }

    const testData = {
      sosId: 'test_' + Date.now(),
      userName: 'Test User',
      userPhone: '+1234567890',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York, NY, USA'
      },
      message: 'This is a test notification',
      timestamp: new Date()
    };

    const result = await require('./utils/notifications').sendPushNotification(fcmToken, testData);
    
    res.json({
      success: result.success,
      message: result.success ? 'Test notification sent successfully' : 'Failed to send test notification',
      details: result
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during test notification'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // CORS error
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation'
    });
  }
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors
    });
  }
  
  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  // Default error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Navi Shakti API Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated');
        mongoose.connection.close();
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated');
        mongoose.connection.close();
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
