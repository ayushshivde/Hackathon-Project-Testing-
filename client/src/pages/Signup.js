import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiShield, 
  FiUser, 
  FiPhone,
  FiArrowRight,
  FiCheck
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { initMessaging, requestNotificationPermission } from '../firebase';
import axios from '../utils/axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Please select a JPG, PNG, or WEBP image');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image must be less than 3MB');
      return;
    }
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return false;
    }
    if (!avatarFile) {
      toast.error('Profile photo is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        avatar: avatarFile || undefined
      });
      
      if (result.success) {
        // After signup, setup notifications
        try {
          const hasPermission = await requestNotificationPermission();
          if (hasPermission) {
            const result = await initMessaging();
            if (result && result.token) {
              await axios.put('/api/auth/profile', { fcmToken: result.token });
              console.log('FCM token saved after signup');
            }
          }
        } catch (err) {
          console.warn('FCM setup after signup failed:', err);
        }
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { text: 'At least 6 characters', met: formData.password.length >= 6 },
    { text: 'Contains letters and numbers', met: /[A-Za-z]/.test(formData.password) && /\d/.test(formData.password) }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Sign Up - Nari Shakti Shield</title>
        <meta name="description" content="Create your Navi Shakti account for women's safety and empowerment." />
      </Helmet>

      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
              <FiShield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 font-display">
            Join Navi Shakti
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account and start your safety journey
          </p>
        </motion.div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Avatar Upload */}
            <div>
              <p className="text-sm mb-2">
                <span className="text-red-600 font-semibold mr-2">Instruction:</span>
                <span className="text-gray-800">Please upload a clear, front-facing photo of your face — no side angles, no blur, no zoom.</span>
              </p>
              <div className="flex flex-col items-stretch">
                <div
                  className="w-full rounded-xl bg-gray-200 overflow-hidden flex items-center justify-center border border-gray-300 cursor-pointer"
                  style={{ aspectRatio: '1 / 1' }}
                  onClick={() => { if (avatarPreview) setIsImagePreviewOpen(true); }}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-sm text-gray-500">No image</div>
                  )}
                </div>
                <div className="mt-3">
                  <input
                    id="signup-avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('signup-avatar-input').click()}
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    Upload photo
                  </button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, or WEBP. Max 3MB.</p>
                </div>
              </div>
            </div>
            {isImagePreviewOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={() => setIsImagePreviewOpen(false)}>
                <img src={avatarPreview} alt="Preview" className="max-w-[90vw] max-h-[90vh] object-contain" />
              </div>
            )}
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <FiCheck className={`w-4 h-4 mr-2 ${req.met ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center text-sm">
                  <FiCheck className={`w-4 h-4 mr-2 ${
                    formData.password === formData.confirmPassword ? 'text-green-500' : 'text-red-500'
                  }`} />
                  <span className={
                    formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'
                  }>
                    {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                  </span>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading || !agreedToTerms}
                className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="loading-spinner mr-2"></div>
                ) : (
                  <FiArrowRight className="w-5 h-5 mr-2" />
                )}
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Login Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
            >
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
