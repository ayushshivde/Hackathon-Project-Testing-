import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  FiShield, 
  FiMapPin, 
  FiUsers, 
  FiBell, 
  FiMic, 
  FiSmartphone,
  FiHeart,
  FiStar,
  FiCheckCircle
} from 'react-icons/fi';

const Home = () => {
  const features = [
    {
      icon: FiShield,
      title: 'Emergency SOS',
      description: 'One-tap emergency button to alert your trusted contacts with your exact location.'
    },
    {
      icon: FiMapPin,
      title: 'Real-time Location',
      description: 'Share your location instantly with GPS accuracy and address information.'
    },
    {
      icon: FiUsers,
      title: 'Trusted Contacts',
      description: 'Add family and friends who will be notified during emergencies.'
    },
    {
      icon: FiBell,
      title: 'Instant Notifications',
      description: 'Real-time alerts sent via SMS, email, and push notifications.'
    },
    {
      icon: FiMic,
      title: 'Voice Commands',
      description: 'Activate SOS using voice commands for hands-free emergency assistance.'
    },
    {
      icon: FiSmartphone,
      title: 'Mobile Optimized',
      description: 'Fully responsive design that works perfectly on all devices.'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Mumbai, India',
      text: 'Navi Shakti gives me peace of mind when I travel alone. The SOS feature is incredibly reliable.',
      rating: 5
    },
    {
      name: 'Sarah Johnson',
      location: 'New York, USA',
      text: 'As a working woman, I feel much safer knowing my family can track my location during emergencies.',
      rating: 5
    },
    {
      name: 'Aisha Ahmed',
      location: 'Dubai, UAE',
      text: 'The voice command feature is a game-changer. It works even when I can\'t reach my phone.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Navi Shakti - Women's Safety & Empowerment</title>
        <meta name="description" content="Empowering women with advanced safety tools, emergency assistance, and real-time location sharing. Your safety is our priority." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-50 via-white to-red-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 font-display mb-6">
                Your Safety,
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">
                  {' '}Our Priority
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Navi Shakti empowers women with advanced safety tools, emergency assistance, 
                and real-time location sharing. Feel secure and confident wherever you go.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center"
                >
                  <FiShield className="w-5 h-5 mr-2" />
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="btn-outline text-lg px-8 py-4 inline-flex items-center justify-center"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="text-center">
                  <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 emergency-pulse">
                    <FiShield className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Emergency SOS</h3>
                  <p className="text-gray-600 mb-6">
                    One tap to alert your trusted contacts with your exact location
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-green-600">
                      <FiCheckCircle className="w-4 h-4 mr-2" />
                      GPS Location
                    </div>
                    <div className="flex items-center text-green-600">
                      <FiCheckCircle className="w-4 h-4 mr-2" />
                      Instant Alerts
                    </div>
                    <div className="flex items-center text-green-600">
                      <FiCheckCircle className="w-4 h-4 mr-2" />
                      Voice Commands
                    </div>
                    <div className="flex items-center text-green-600">
                      <FiCheckCircle className="w-4 h-4 mr-2" />
                      Real-time Updates
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-display mb-4">
              Powerful Safety Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to stay safe and connected, designed specifically for women's safety needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-display mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and have peace of mind wherever you go.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Create Account
              </h3>
              <p className="text-gray-600">
                Sign up with your email and add your trusted contacts who will be notified during emergencies.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Enable Location
              </h3>
              <p className="text-gray-600">
                Allow location access so we can share your exact position with your trusted contacts when needed.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Stay Safe
              </h3>
              <p className="text-gray-600">
                Use the SOS button or voice commands to instantly alert your contacts with your location.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-display mb-4">
              Trusted by Women Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our users have to say about their safety experience with Navi Shakti.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-red-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white font-display mb-6">
              Ready to Take Control of Your Safety?
            </h2>
            <p className="text-xl text-pink-100 mb-8">
              Join thousands of women who trust Navi Shakti for their safety and peace of mind.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-white text-pink-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-colors duration-200 inline-flex items-center justify-center"
              >
                <FiHeart className="w-5 h-5 mr-2" />
                Start Your Safety Journey
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white hover:bg-white hover:text-pink-600 font-semibold py-4 px-8 rounded-lg transition-colors duration-200 inline-flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
