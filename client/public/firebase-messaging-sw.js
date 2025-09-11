    // This file must be in /public
    importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

    firebase.initializeApp({
        apiKey: "AIzaSyDQUeEtCBl9Vd1MymHrfRlibWFKc_Jk2QI",
        authDomain: "nari-sakti.firebaseapp.com",
        projectId: "nari-sakti",
        storageBucket: "nari-sakti.firebasestorage.app",
        messagingSenderId: "401966681166",
        appId: "1:401966681166:web:74cd3be41a59854823c71f",
        measurementId: "G-XXBW2N8VKZ"
    });

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      const { title, body, icon } = payload.notification || {};
      self.registration.showNotification(title || 'Navi Shakti', {
        body: body || 'Emergency alert',
        icon: icon || '/logo192.png',
      });
    });