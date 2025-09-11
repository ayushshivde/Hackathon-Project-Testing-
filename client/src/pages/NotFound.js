import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiHome, FiArrowLeft, FiShield } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Page Not Found - Navi Shakti</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Helmet>

      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShield className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-6xl font-bold text-gray-900 font-display mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 mb-8">
              Sorry, we couldn't find the page you're looking for. 
              It might have been moved, deleted, or doesn't exist.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              to="/"
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <FiHome className="w-5 h-5" />
              <span>Go Home</span>
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="btn-outline w-full flex items-center justify-center space-x-2"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Need Help?
            </h3>
            <p className="text-sm text-blue-700">
              If you're looking for safety features, try visiting the{' '}
              <Link to="/dashboard" className="font-medium underline">
                Dashboard
              </Link>{' '}
              or{' '}
              <Link to="/contacts" className="font-medium underline">
                Trusted Contacts
              </Link>{' '}
              page.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
