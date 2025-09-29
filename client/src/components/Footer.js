import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                <FiShield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-display">Nari Shakti Shield</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Empowering women with safety tools and emergency assistance. 
              Your safety is our priority, and we're here to help you feel secure and confident.
            </p>
            <div className="flex space-x-4">
              <a
                href="mailto:support@navishakti.com"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <FiMail className="w-5 h-5" />
              </a>
              <a
                href="tel:+1234567890"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <FiPhone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/contacts"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Trusted Contacts
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FiMail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">support@narishaktishield.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiPhone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">+1 (234) 567-8900</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiMapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">Available Worldwide</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Nari Shakti Shield. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
              >
                Safety Guidelines
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
