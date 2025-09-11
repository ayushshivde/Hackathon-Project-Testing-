import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

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

import { initMessaging, onForegroundMessage } from './firebase';
import axios from 'axios';

async function setupNotifications() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const result = await initMessaging();
    if (!result) return;
    const { token } = result;

    // Send token to backend to save on user profile (field: fcmToken)
    await axios.put('/api/auth/profile', { fcmToken: token });

    // Optional: Foreground handler
    onForegroundMessage((payload) => {
      // show in-app toast/alert
      console.log('Foreground notification:', payload);
    });
  } catch (e) {
    console.error('Notification setup failed:', e);
  }
}

// Call setupNotifications after user logs in