import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { initMessaging, onForegroundMessage, requestNotificationPermission } from './firebase';
import axios from './utils/axios';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <LocationProvider>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </LocationProvider>
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);



async function setupNotifications() {
  try {
    console.log('Setting up notifications...');
    
    // Request notification permission first
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return;
    }

    // Initialize FCM
    const result = await initMessaging();
    if (!result || !result.token) {
      console.log('Failed to get FCM token');
      return;
    }

    const { token } = result;
    console.log('FCM token obtained, sending to backend...');

    // Send token to backend to save on user profile (field: fcmToken)
    try {
      await axios.put('/api/auth/profile', { fcmToken: token });
      console.log('FCM token saved to backend');
    } catch (error) {
      console.error('Failed to save FCM token to backend:', error);
    }

    // Setup foreground message handler
    onForegroundMessage((payload) => {
      console.log('Foreground notification received:', payload);
      
      // Show in-app notification
      if (payload.notification) {
        const { title, body } = payload.notification;
        
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, {
            body: body,
            icon: '/logo192.png',
            badge: '/badge-72x72.png',
            tag: 'sos-alert',
            requireInteraction: true
          });
        }
        
        console.log('Notification:', title, body);
        console.log(title)
      }
    });

    console.log('Notification setup completed successfully');
  } catch (e) {
    console.error('Notification setup failed:', e);
  }
}

// Call setupNotifications after user logs in
// This will be called from AuthContext when user logs in
// window.setupNotifications = setupNotifications;
window.setupNotifications = setupNotifications;
