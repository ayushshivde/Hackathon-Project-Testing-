import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Firebase config (replace with your own from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyDQUeEtCBl9Vd1MymHrfRlibWFKc_Jk2QI",
  authDomain: "nari-sakti.firebaseapp.com",
  projectId: "nari-sakti",
  storageBucket: "nari-sakti.firebasestorage.app",
  messagingSenderId: "401966681166",
  appId: "1:401966681166:web:74cd3be41a59854823c71f",
  measurementId: "G-XXBW2N8VKZ"
};

const app = initializeApp(firebaseConfig);

// Initialize FCM and get token
export const initMessaging = async () => {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.log('FCM not supported in this browser');
      return null;
    }

    const messaging = getMessaging(app);
    
    // VAPID key for web push
    // Get this from Firebase Console → Project Settings → Cloud Messaging → Web configuration
    // Look for "Web Push certificates" section and copy the key pair
    const vapidKey = process.env.REACT_APP_VAPID_KEY;

    if (!vapidKey) {
      console.warn('No VAPID key found. Trying without VAPID key...');
      console.warn('To get VAPID key: Firebase Console → Project Settings → Cloud Messaging → Web configuration');
    }

    console.log('Requesting FCM token...');
    
    // Try to get token without VAPID key first (some configurations work without it)
    let token;
    try {
      if (vapidKey && vapidKey.length > 80) {
        token = await getToken(messaging, { vapidKey });
      } else {
        // Try without VAPID key
        token = await getToken(messaging);
      }
    } catch (vapidError) {
      console.warn('VAPID key error, trying without VAPID key:', vapidError.message);
      try {
        token = await getToken(messaging);
      } catch (noVapidError) {
        console.error('Failed to get token even without VAPID key:', noVapidError.message);
        throw noVapidError;
      }
    }
    
    if (token) {
      console.log('FCM token obtained successfully');
      return { messaging, token };
    } else {
      console.log('No FCM token available');
      return null;
    }
  } catch (err) {
    console.error('FCM init error:', err);
    console.error('Error details:', err.message);
    return null;
  }
};

// Listen for foreground messages
export const onForegroundMessage = async (callback) => {
  const supported = await isSupported();
  if (!supported) return;
  const messaging = getMessaging(app);
  onMessage(messaging, callback);
};

// Request notification permission
export const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      console.log('Notification permission already granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Notification permission denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};