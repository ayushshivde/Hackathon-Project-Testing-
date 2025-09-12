import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiPhone, FiMail, FiStar } from 'react-icons/fi';
import axios from '../utils/axios';
import toast from 'react-hot-toast';

const ContactModal = ({ contact, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: 'friend',
    isPrimary: false
  });
  const [isLoading, setIsLoading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        phone: contact.phone || '',
        email: contact.email || '',
        relationship: contact.relationship || 'friend',
        isPrimary: contact.isPrimary || false
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        relationship: 'friend',
        isPrimary: false
      });
    }
  }, [contact]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (contact) {
        // Update existing contact
        const response = await axios.put(`/api/contacts/${contact._id}`, formData);
        if (response.data.success) {
          toast.success('Contact updated successfully');
          onSave();
        } else {
          throw new Error(response.data.message);
        }
      } else {
        // Create new contact
        const response = await axios.post('/api/contacts', formData);
        if (response.data.success) {
          toast.success('Contact added successfully');
          onSave();
        } else {
          throw new Error(response.data.message);
        }
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error(error.response?.data?.message || 'Failed to save contact');
    } finally {
      setIsLoading(false);
    }
  };

  const relationshipOptions = [
    { value: 'family', label: 'Family' },
    { value: 'friend', label: 'Friend' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'neighbor', label: 'Neighbor' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity z-40"
            // Disable backdrop click to prevent accidental closes on desktop
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-50 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {contact ? 'Edit Contact' : 'Add New Contact'}
                  </h3>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="Enter full name"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="Enter email address (optional)"
                      />
                    </div>
                  </div>

                  {/* Relationship */}
                  <div>
                    <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-2">
                      Relationship
                    </label>
                    <select
                      id="relationship"
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleChange}
                      className="input-field"
                    >
                      {relationshipOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Primary Contact */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPrimary"
                      name="isPrimary"
                      checked={formData.isPrimary}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPrimary" className="ml-3 flex items-center text-sm text-gray-700">
                      <FiStar className="w-4 h-4 text-yellow-500 mr-1" />
                      Set as primary contact
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="loading-spinner mr-2"></div>
                  ) : null}
                  {isLoading ? 'Saving...' : (contact ? 'Update Contact' : 'Add Contact')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ContactModal;
