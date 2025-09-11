import React from 'react';
import { FiLoader } from 'react-icons/fi';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <FiLoader className={`${sizeClasses[size]} animate-spin text-primary-600 mx-auto mb-4`} />
        <p className="text-gray-600 font-medium">{text}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
