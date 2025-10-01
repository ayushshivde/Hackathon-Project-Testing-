import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiShield, 
  FiSettings, 
  FiSave,
  FiEye,
  FiEyeOff,
  FiLock
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  
  // Profile form data
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    emergencySettings: {
      autoLocation: true,
      voiceCommands: false,
      panicMode: false
    }
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        emergencySettings: {
          autoLocation: user.emergencySettings?.autoLocation ?? true,
          voiceCommands: user.emergencySettings?.voiceCommands ?? false,
          panicMode: user.emergencySettings?.panicMode ?? false
        }
      });
      setAvatarPreview(user.avatarUrl ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.avatarUrl}`) : '');
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('emergencySettings.')) {
      const settingName = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        emergencySettings: {
          ...prev.emergencySettings,
          [settingName]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateUser({ ...profileData, avatar: avatarFile || undefined });
      if (result.success) {
        toast.success('Profile updated successfully');
        if (avatarFile) {
          setAvatarFile(null);
        }
      }
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast.success('Password changed successfully');
      }
    } catch (error) {
      console.error('Password change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Profile - Navi Shakti</title>
        <meta name="description" content="Manage your profile and account settings." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-display">
            Profile Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="card"
            >
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Personal Information
                  </h2>
                  
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    {/* Avatar */}
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
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-contain" />
                          ) : (
                            <div className="text-sm text-gray-500">No image</div>
                          )}
                        </div>
                        <div className="mt-3">
                          <input
                            id="profile-avatar-input"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById('profile-avatar-input').click()}
                            className="btn-primary px-4 py-2 text-sm"
                          >
                            Edit photo
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiUser className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={profileData.name}
                            onChange={handleProfileChange}
                            className="input-field pl-10"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiPhone className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            className="input-field pl-10"
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>
                    </div>

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
                          value={user?.email || ''}
                          disabled
                          className="input-field pl-10 bg-gray-50 text-gray-500"
                          placeholder="Email address"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Email address cannot be changed
                      </p>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <FiSave className="w-4 h-4" />
                        <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Change Password
                  </h2>
                  
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          id="currentPassword"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="input-field pl-10 pr-10"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.current ? (
                            <FiEyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <FiEye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          id="newPassword"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="input-field pl-10 pr-10"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.new ? (
                            <FiEyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <FiEye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="input-field pl-10 pr-10"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.confirm ? (
                            <FiEyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <FiEye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <FiLock className="w-4 h-4" />
                        <span>{isLoading ? 'Changing...' : 'Change Password'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Emergency Settings
                  </h2>
                  
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">Auto Location Sharing</h3>
                          <p className="text-sm text-gray-600">
                            Automatically share your location when triggering SOS
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="emergencySettings.autoLocation"
                            checked={profileData.emergencySettings.autoLocation}
                            onChange={handleProfileChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">Voice Commands</h3>
                          <p className="text-sm text-gray-600">
                            Enable voice-activated SOS commands
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="emergencySettings.voiceCommands"
                            checked={profileData.emergencySettings.voiceCommands}
                            onChange={handleProfileChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">Panic Mode</h3>
                          <p className="text-sm text-gray-600">
                            Quick access to emergency features
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="emergencySettings.panicMode"
                            checked={profileData.emergencySettings.panicMode}
                            onChange={handleProfileChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <FiSettings className="w-4 h-4" />
                        <span>{isLoading ? 'Saving...' : 'Save Settings'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
