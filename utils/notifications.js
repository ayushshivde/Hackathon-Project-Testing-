const admin = require('firebase-admin');
const axios = require('axios');

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (!firebaseInitialized && process.env.FIREBASE_PROJECT_ID) {
    try {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });

      firebaseInitialized = true;
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }
};

// Send push notification via FCM
const sendPushNotification = async (fcmToken, notificationData) => {
  try {
    initializeFirebase();

    if (!firebaseInitialized) {
      throw new Error('Firebase not initialized');
    }

    const message = {
      token: fcmToken,
      notification: {
        title: '🚨 Emergency Alert - Navi Shakti',
        body: `${notificationData.userName} needs help! Location: ${notificationData.location.address}`,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png'
      },
      data: {
        sosId: notificationData.sosId.toString(),
        userName: notificationData.userName,
        userPhone: notificationData.userPhone,
        latitude: notificationData.location.latitude.toString(),
        longitude: notificationData.location.longitude.toString(),
        address: notificationData.location.address,
        message: notificationData.message,
        timestamp: notificationData.timestamp.toISOString(),
        type: 'sos_alert'
      },
      android: {
        priority: 'high',
        notification: {
          priority: 'high',
          sound: 'default',
          channelId: 'sos_alerts'
        }
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: '🚨 Emergency Alert - Navi Shakti',
              body: `${notificationData.userName} needs help! Location: ${notificationData.location.address}`
            },
            sound: 'default',
            badge: 1,
            category: 'SOS_ALERT'
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('Push notification sent successfully:', response);
    
    return {
      success: true,
      messageId: response,
      method: 'push'
    };
  } catch (error) {
    console.error('Push notification error:', error);
    return {
      success: false,
      error: error.message,
      method: 'push'
    };
  }
};

// Send SMS notification (using Twilio or similar service)
const sendSMSNotification = async (phoneNumber, notificationData) => {
  try {
    // For demo purposes, we'll simulate SMS sending
    // In production, integrate with Twilio, AWS SNS, or similar service
    
    const smsBody = `🚨 EMERGENCY ALERT - Navi Shakti
${notificationData.userName} needs immediate help!

Location: ${notificationData.location.address}
Coordinates: ${notificationData.location.latitude}, ${notificationData.location.longitude}
Time: ${new Date(notificationData.timestamp).toLocaleString()}
Message: ${notificationData.message}

Please contact ${notificationData.userName} at ${notificationData.userPhone} immediately!

Reply STOP to opt out.`;

    console.log(`SMS would be sent to ${phoneNumber}:`, smsBody);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      success: true,
      messageId: `sms_${Date.now()}`,
      method: 'sms'
    };
  } catch (error) {
    console.error('SMS notification error:', error);
    return {
      success: false,
      error: error.message,
      method: 'sms'
    };
  }
};

// Send email notification
const sendEmailNotification = async (email, notificationData) => {
  try {
    // For demo purposes, we'll simulate email sending
    // In production, integrate with SendGrid, AWS SES, or similar service
    
    const emailSubject = `🚨 Emergency Alert - ${notificationData.userName} needs help!`;
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Emergency Alert - Navi Shakti</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .alert-box { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0; }
        .info-box { background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 4px; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 Emergency Alert - Navi Shakti</h1>
        </div>
        <div class="content">
            <div class="alert-box">
                <h2>URGENT: ${notificationData.userName} needs immediate help!</h2>
                <p>This is an automated emergency alert from the Navi Shakti safety app.</p>
            </div>
            
            <div class="info-box">
                <h3>Emergency Details:</h3>
                <p><strong>Name:</strong> ${notificationData.userName}</p>
                <p><strong>Phone:</strong> ${notificationData.userPhone}</p>
                <p><strong>Location:</strong> ${notificationData.location.address}</p>
                <p><strong>Coordinates:</strong> ${notificationData.location.latitude}, ${notificationData.location.longitude}</p>
                <p><strong>Time:</strong> ${new Date(notificationData.timestamp).toLocaleString()}</p>
                <p><strong>Message:</strong> ${notificationData.message}</p>
            </div>
            
            <div style="text-align: center;">
                <a href="tel:${notificationData.userPhone}" class="button">Call ${notificationData.userName}</a>
                <a href="https://maps.google.com/?q=${notificationData.location.latitude},${notificationData.location.longitude}" class="button" style="background-color: #28a745;">View Location</a>
            </div>
            
            <p><strong>Please take immediate action:</strong></p>
            <ul>
                <li>Call ${notificationData.userName} immediately</li>
                <li>If no response, contact local emergency services</li>
                <li>Share this information with other trusted contacts</li>
                <li>Keep this email for your records</li>
            </ul>
        </div>
        <div class="footer">
            <p>This is an automated message from Navi Shakti - Women's Safety App</p>
            <p>If you believe this is a false alarm, please contact ${notificationData.userName} to confirm their safety.</p>
        </div>
    </div>
</body>
</html>`;

    console.log(`Email would be sent to ${email}:`, emailSubject);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      success: true,
      messageId: `email_${Date.now()}`,
      method: 'email'
    };
  } catch (error) {
    console.error('Email notification error:', error);
    return {
      success: false,
      error: error.message,
      method: 'email'
    };
  }
};

// Main notification function that tries multiple methods
const sendNotification = async (contact, notificationData) => {
  const results = [];
  
  try {
    // Send SMS if phone number is available
    if (contact.phone) {
      const smsResult = await sendSMSNotification(contact.phone, notificationData);
      results.push(smsResult);
    }
    
    // Send email if email is available
    if (contact.email) {
      const emailResult = await sendEmailNotification(contact.email, notificationData);
      results.push(emailResult);
    }
    
    // Send push notification if FCM token is available
    // Note: This would require the contact to also be a user of the app
    // For now, we'll skip this as contacts are typically external
    
    // Return overall result
    const successfulNotifications = results.filter(r => r.success);
    const failedNotifications = results.filter(r => !r.success);
    
    return {
      success: successfulNotifications.length > 0,
      results: results,
      successfulCount: successfulNotifications.length,
      failedCount: failedNotifications.length,
      errors: failedNotifications.map(r => r.error)
    };
  } catch (error) {
    console.error('Notification sending error:', error);
    return {
      success: false,
      error: error.message,
      results: results
    };
  }
};

// Send test notification (for testing purposes)
const sendTestNotification = async (contact, message = 'This is a test notification from Navi Shakti') => {
  const testData = {
    sosId: 'test_' + Date.now(),
    userName: 'Test User',
    userPhone: '+1234567890',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: 'New York, NY, USA'
    },
    message: message,
    timestamp: new Date()
  };
  
  return await sendNotification(contact, testData);
};

module.exports = {
  sendNotification,
  sendPushNotification,
  sendSMSNotification,
  sendEmailNotification,
  sendTestNotification
};
