# Nari Shakti - Women's Safety & Empowerment App

A comprehensive web application designed to empower women with advanced safety tools, emergency assistance, and real-time location sharing. Built with React, Node.js, Express, and MongoDB.

## 🚀 Features

### Core Safety Features
- **Emergency SOS Button** - One-tap emergency alert with location sharing
- **Real-time Location Sharing** - GPS-based location tracking and sharing
- **Trusted Contacts Management** - Add and manage emergency contacts
- **Voice Commands** - Hands-free SOS activation using voice recognition
- **Instant Notifications** - SMS, email, and push notifications to contacts

### User Experience
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Modern UI** - Built with Tailwind CSS for beautiful, accessible interface
- **Real-time Updates** - Live location tracking and status updates
- **Secure Authentication** - JWT-based authentication with password hashing
- **Profile Management** - Comprehensive user profile and settings

### Technical Features
- **RESTful API** - Well-structured backend with Express.js
- **Database Integration** - MongoDB for data persistence
- **Google Maps Integration** - Location services and mapping
- **Firebase Notifications** - Real-time push notifications
- **Security** - bcrypt password hashing, CORS protection, rate limiting

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Icons** - Beautiful icon library
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Express Rate Limit** - Rate limiting middleware

### External Services
- **Google Maps API** - Location services and geocoding
- **Firebase Cloud Messaging** - Push notifications
- **Pusher** - Real-time communication (alternative to Firebase)

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)
- **Google Maps API Key**
- **Firebase Project** (for notifications)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd navi-shakti
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/navi-shakti

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# Pusher Configuration (Alternative to Firebase)
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-pusher-cluster
```

### 4. Update Google Maps API Key

Update the Google Maps API key in `client/public/index.html`:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places,geometry" async defer></script>
```

### 5. Run the Application

```bash
# Start both backend and frontend
npm run dev:full

# Or start them separately:

# Backend only
npm run dev

# Frontend only
npm run client
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📁 Project Structure

```
navi-shakti/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── App.js
│   ├── package.json
│   └── tailwind.config.js
├── models/                 # MongoDB models
│   ├── User.js
│   └── SosRequest.js
├── routes/                 # API routes
│   ├── auth.js
│   ├── sos.js
│   └── contacts.js
├── middleware/             # Express middleware
│   └── auth.js
├── utils/                  # Utility functions
│   └── notifications.js
├── server.js              # Express server
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

### SOS Requests
- `POST /api/sos/trigger` - Trigger SOS emergency
- `GET /api/sos/active` - Get active SOS request
- `GET /api/sos/history` - Get SOS history
- `PUT /api/sos/:id/resolve` - Resolve SOS request
- `PUT /api/sos/:id/cancel` - Cancel SOS request
- `GET /api/sos/:id` - Get specific SOS request
- `POST /api/sos/:id/note` - Add note to SOS request

### Trusted Contacts
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Add new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact
- `PUT /api/contacts/:id/primary` - Set primary contact
- `GET /api/contacts/primary` - Get primary contact
- `POST /api/contacts/import` - Import contacts

### Maps
- `GET /api/maps/geocode` - Geocode coordinates to address

## 🚀 Deployment

### Backend Deployment (Heroku)

1. **Create Heroku App**
   ```bash
   heroku create navi-shakti-api
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=your-mongodb-atlas-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set GOOGLE_MAPS_API_KEY=your-google-maps-key
   # ... other environment variables
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd client
   vercel
   ```

3. **Set Environment Variables**
   - `REACT_APP_API_URL` - Your backend API URL
   - `REACT_APP_GOOGLE_MAPS_API_KEY` - Your Google Maps API key

### Frontend Deployment (Netlify)

1. **Build the project**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop the `build` folder to Netlify
   - Or connect your GitHub repository

3. **Set Environment Variables**
   - Go to Site settings > Environment variables
   - Add your environment variables

## 🔐 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Authentication** - Secure token-based authentication
- **CORS Protection** - Configured for specific origins
- **Rate Limiting** - Prevents abuse and DDoS attacks
- **Helmet.js** - Security headers
- **Input Validation** - Express-validator for data validation
- **SQL Injection Protection** - MongoDB with Mongoose ODM

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- **Desktop** - Full-featured experience
- **Tablet** - Adapted layout and navigation
- **Mobile** - Touch-friendly interface with large buttons
- **PWA Ready** - Can be installed as a mobile app

## 🧪 Testing

### Backend Testing
```bash
# Run backend tests
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

## 📊 Performance Optimization

- **Code Splitting** - React lazy loading
- **Image Optimization** - Optimized images and icons
- **Bundle Analysis** - Webpack bundle analyzer
- **Caching** - Browser caching strategies
- **CDN** - Content delivery network ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Email**: support@navishakti.com
- **Documentation**: [Project Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first CSS framework
- **MongoDB** - For the flexible database
- **Google Maps** - For location services
- **Firebase** - For push notifications
- **All Contributors** - Thank you for your contributions!

## 📈 Roadmap

### Version 2.0
- [ ] Mobile app (React Native)
- [ ] AI-powered threat detection
- [ ] Integration with local emergency services
- [ ] Community safety features
- [ ] Multi-language support

### Version 3.0
- [ ] IoT device integration
- [ ] Machine learning for safety patterns
- [ ] Advanced analytics dashboard
- [ ] Enterprise features
- [ ] API for third-party integrations

---

**Navi Shakti** - Empowering women with technology for a safer tomorrow. 🌟
