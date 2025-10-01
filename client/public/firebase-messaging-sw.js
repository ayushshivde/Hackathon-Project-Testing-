// This file must be in /public
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
    apiKey: "AIzaSyDQUeEtCBl9Vd1MymHrfRlibWFKc_Jk2QI",
    authDomain: "nari-sakti.firebaseapp.com",
    projectId: "nari-sakti",
    storageBucket: "nari-sakti.firebasestorage.app",
    messagingSenderId: "401966681166",
    appId: "1:401966681166:web:74cd3be41a59854823c71f",
    measurementId: "G-XXBW2N8VKZ"
});

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Background message received:', payload);
    
    const { title, body, icon, data } = payload.notification || {};
    
    const notificationOptions = {
        body: body || 'Emergency alert',
        icon: icon || '/logo192.png',
        badge: '/badge-72x72.png',
        tag: 'sos-alert',
        requireInteraction: true,
        actions: [
            {
                action: 'view',
                title: 'View Details'
            },
            {
                action: 'close',
                title: 'Close'
            }
        ],
        data: payload.data || {}
    };

    return self.registration.showNotification(
        title || '🚨 Emergency Alert - Nari Shakti Shield',
        notificationOptions
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);
    event.notification.close();
    
    const data = event.notification?.data || {};
    const targetPath = data?.type === 'sos_alert' ? '/sos-history' : '/dashboard';
    const fullUrl = self.location.origin + targetPath;
    
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
                for (const client of clientList) {
                if ('focus' in client) {
                    client.postMessage({ type: 'NOTIFICATION_CLICK', url: targetPath, data });
                        return client.focus();
                    }
                }
            return clients.openWindow(fullUrl);
            })
        );
});