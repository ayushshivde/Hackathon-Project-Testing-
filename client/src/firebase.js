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
    // For now, we'll use a placeholder VAPID key
    // In production, get this from Firebase Console → Project Settings → Cloud Messaging → Web configuration
    const vapidKey = process.env.REACT_APP_VAPID_KEY;

    console.log('Requesting FCM token...');
    
    // Get token with VAPID key
    let token;
    try {
      token = await getToken(messaging, { vapidKey });
      console.log('FCM token obtained with VAPID key');
    } catch (vapidError) {
      console.warn('VAPID key error, trying without VAPID key:', vapidError.message);
      try {
        token = await getToken(messaging);
        console.log('FCM token obtained without VAPID key');
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