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
    if (!supported) return null;

    const messaging = getMessaging(app);
    // Set your Web Push certificate (VAPID) key from Firebase Console → Cloud Messaging → Web configuration
    const vapidKey = process.env.REACT_APP_VAPID_KEY || 'REPLACE_WITH_YOUR_VAPID_PUBLIC_KEY';

    const token = await getToken(messaging, { vapidKey });
    return { messaging, token };
  } catch (err) {
    console.error('FCM init error:', err);
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