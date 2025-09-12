import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShield, 
  FiMapPin, 
  FiUsers, 
  FiClock, 
  FiAlertTriangle,
  FiCheckCircle,
  FiX,
  FiMic,
  FiMicOff,
  FiRefreshCw
} from 'react-icons/fi';
import axios from '../utils/axios';
import toast from 'react-hot-toast';
import MapView from '../components/MapView';
import VoiceCommand from '../components/VoiceCommand';

const Dashboard = () => {
  const { user } = useAuth();
  const { currentLocation, getLocationForSOS, requestLocationPermission } = useLocation();
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [sosRequest, setSosRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [stats, setStats] = useState({
    totalContacts: 0,
    recentSOS: 0,
    lastLocation: null
  });

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Check for active SOS on mount
  useEffect(() => {
    checkActiveSOS();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load contacts count
      const contactsResponse = await axios.get('/api/contacts');
      if (contactsResponse.data.success) {
        setStats(prev => ({
          ...prev,
          totalContacts: contactsResponse.data.data.contacts.length
        }));
      }

      // Load recent SOS count
      const sosResponse = await axios.get('/api/sos/history?limit=5');
      if (sosResponse.data.success) {
        setStats(prev => ({
          ...prev,
          recentSOS: sosResponse.data.data.sosRequests.length
        }));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const checkActiveSOS = async () => {
    try {
      const response = await axios.get('/api/sos/active');
      if (response.data.success && response.data.data.sosRequest) {
        setSosRequest(response.data.data.sosRequest);
        setIsSOSActive(true);
      }
    } catch (error) {
      console.error('Error checking active SOS:', error);
    }
  };

  const triggerSOS = async () => {
    if (isSOSActive) {
      toast.error('SOS is already active');
      return;
    }

    setIsLoading(true);

    try {
      // Get current location
      const location = await getLocationForSOS();
      
      if (!location) {
        toast.error('Unable to get your location. Please enable location services.');
        return;
      }

      // Trigger SOS
      const response = await axios.post('/api/sos/trigger', {
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
          accuracy: location.accuracy
        },
        message: 'Emergency SOS activated',
        triggeredBy: 'button'
      });

      if (response.data.success) {
        setSosRequest(response.data.data.sosRequest);
        setIsSOSActive(true);
        toast.success('SOS activated! Your contacts have been notified.');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('SOS trigger error:', error);
      toast.error(error.response?.data?.message || 'Failed to trigger SOS');
    } finally {
      setIsLoading(false);
    }
  };

  const resolveSOS = async () => {
    if (!sosRequest) return;

    setIsLoading(true);

    try {
      const sosId = sosRequest.id || sosRequest._id;
      const response = await axios.put(`/api/sos/${sosId}/resolve`, {
        notes: 'SOS resolved by user'
      });

      if (response.data.success) {
        setSosRequest(null);
        setIsSOSActive(false);
        toast.success('SOS resolved successfully');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('SOS resolve error:', error);
      toast.error(error.response?.data?.message || 'Failed to resolve SOS');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSOS = async () => {
    if (!sosRequest) return;

    setIsLoading(true);

    try {
      const sosId = sosRequest.id || sosRequest._id;
      const response = await axios.put(`/api/sos/${sosId}/cancel`);

      if (response.data.success) {
        setSosRequest(null);
        setIsSOSActive(false);
        toast.success('SOS cancelled');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('SOS cancel error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel SOS');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLocation = async () => {
    try {
      const result = await requestLocationPermission();
      if (result.success) {
        toast.success('Location updated');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to refresh location');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Dashboard - Navi Shakti</title>
        <meta name="description" content="Your safety dashboard with emergency SOS and location services." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-display">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Your safety is our priority. Stay connected and secure.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trusted Contacts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiClock className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent SOS</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentSOS}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiMapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Location Status</p>
                <p className="text-sm font-bold text-gray-900">
                  {currentLocation ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SOS Button Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="card text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Emergency SOS
            </h2>
            
            {isSOSActive ? (
              <div className="space-y-6">
                <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center mx-auto emergency-pulse">
                  <FiAlertTriangle className="w-16 h-16 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-red-600 mb-2">
                    SOS Active
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your contacts have been notified. Emergency services may be contacted.
                  </p>
                  <div className="flex space-x-4 justify-center">
                    <button
                      onClick={resolveSOS}
                      disabled={isLoading}
                      className="btn-primary flex items-center"
                    >
                      <FiCheckCircle className="w-4 h-4 mr-2" />
                      Resolve
                    </button>
                    <button
                      onClick={cancelSOS}
                      disabled={isLoading}
                      className="btn-outline flex items-center"
                    >
                      <FiX className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <button
                  onClick={triggerSOS}
                  disabled={isLoading}
                  className="sos-button mx-auto flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <FiShield className="w-8 h-8" />
                  )}
                </button>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Tap to Alert
                  </h3>
                  <p className="text-gray-600">
                    Press the button to send your location to trusted contacts
                  </p>
                </div>
              </div>
            )}

            {/* Voice Command Toggle */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    voiceEnabled 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {voiceEnabled ? (
                    <FiMic className="w-4 h-4" />
                  ) : (
                    <FiMicOff className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    Voice Commands {voiceEnabled ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Location and Map Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Your Location
              </h2>
              <button
                onClick={refreshLocation}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <FiRefreshCw className="w-5 h-5" />
              </button>
            </div>

            {currentLocation ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FiMapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Current Address</span>
                  </div>
                  <p className="text-gray-900">{currentLocation.address}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Updated: {new Date(currentLocation.timestamp).toLocaleString()}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="flex-1 btn-outline"
                  >
                    {showMap ? 'Hide Map' : 'Show Map'}
                  </button>
                </div>

                {showMap && (
                  <div className="h-64 rounded-lg overflow-hidden">
                    <MapView
                      latitude={currentLocation.latitude}
                      longitude={currentLocation.longitude}
                      address={currentLocation.address}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Location Not Available
                </h3>
                <p className="text-gray-600 mb-4">
                  Enable location services to use safety features
                </p>
                <button
                  onClick={refreshLocation}
                  className="btn-primary"
                >
                  Enable Location
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="/contacts"
              className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiUsers className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Contacts</h3>
                  <p className="text-sm text-gray-600">Add trusted contacts</p>
                </div>
              </div>
            </a>

            <a
              href="/sos-history"
              className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiClock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">SOS History</h3>
                  <p className="text-sm text-gray-600">View past emergencies</p>
                </div>
              </div>
            </a>

            <a
              href="/profile"
              className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FiShield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Profile Settings</h3>
                  <p className="text-sm text-gray-600">Update your profile</p>
                </div>
              </div>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Voice Command Component */}
      <AnimatePresence>
        {voiceEnabled && (
          <VoiceCommand
            onSOSTrigger={triggerSOS}
            isSOSActive={isSOSActive}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
