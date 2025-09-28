import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger" // danger, warning, info
}) => {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: FiAlertTriangle,
          iconColor: 'text-red-500',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          confirmText: 'text-white'
        };
      case 'warning':
        return {
          icon: FiAlertTriangle,
          iconColor: 'text-yellow-500',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
          confirmText: 'text-white'
        };
      case 'info':
        return {
          icon: FiAlertTriangle,
          iconColor: 'text-blue-500',
          confirmBg: 'bg-blue-600 hover:bg-blue-700',
          confirmText: 'text-white'
        };
      default:
        return {
          icon: FiAlertTriangle,
          iconColor: 'text-gray-500',
          confirmBg: 'bg-gray-600 hover:bg-gray-700',
          confirmText: 'text-white'
        };
    }
  };

  const { icon: Icon, iconColor, confirmBg, confirmText: confirmTextColor } = getIconAndColors();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        
        {/* Dialog */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Icon className={`w-6 h-6 ${iconColor}`} />
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600 leading-relaxed">{message}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 rounded-b-xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium ${confirmTextColor} ${confirmBg} rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmationDialog;
