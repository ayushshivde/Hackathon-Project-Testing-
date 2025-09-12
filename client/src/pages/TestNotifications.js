import React, { useState, useEffect } from 'react';
import { initMessaging, requestNotificationPermission } from '../firebase';
import axios from '../utils/axios';
import toast from 'react-hot-toast';

const TestNotifications = () => {
  const [fcmToken, setFcmToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('');

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    } else {
      setPermissionStatus('Not supported');
    }
  };

  const setupNotifications = async () => {
    setIsLoading(true);
    try {
      console.log('Setting up notifications...');
      
      // Request permission
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        toast.error('Notification permission denied');
        return;
      }

      // Get FCM token
      const result = await initMessaging();
      if (!result || !result.token) {
        toast.error('Failed to get FCM token');
        return;
      }

      setFcmToken(result.token);
      toast.success('FCM token obtained successfully!');
      
      // Save to backend
      try {
        await axios.put('/api/auth/profile', { fcmToken: result.token });
        toast.success('FCM token saved to backend');
      } catch (error) {
        console.error('Failed to save FCM token:', error);
        toast.error('Failed to save FCM token to backend');
      }
    } catch (error) {
      console.error('Notification setup error:', error);
      toast.error('Notification setup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!fcmToken) {
      toast.error('No FCM token available. Please setup notifications first.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/api/test-notification', { fcmToken });
      
      if (response.data.success) {
        toast.success('Test notification sent successfully!');
      } else {
        toast.error('Failed to send test notification: ' + response.data.message);
      }
    } catch (error) {
      console.error('Test notification error:', error);
      toast.error('Failed to send test notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Test Notifications
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Permission Status
            </label>
            <div className={`px-3 py-2 rounded-md text-sm ${
              permissionStatus === 'granted' ? 'bg-green-100 text-green-800' :
              permissionStatus === 'denied' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {permissionStatus}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              FCM Token
            </label>
            <textarea
              value={fcmToken}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs font-mono"
              rows={4}
              placeholder="FCM token will appear here after setup"
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={setupNotifications}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Setting up...' : 'Setup Notifications'}
            </button>

            <button
              onClick={sendTestNotification}
              disabled={isLoading || !fcmToken}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Test Notification'}
            </button>
          </div>

          <div className="text-xs text-gray-500 mt-4">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Click "Setup Notifications" to get FCM token</li>
              <li>Allow notification permission when prompted</li>
              <li>Click "Send Test Notification" to test</li>
              <li>Check your browser/system notifications</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestNotifications;
