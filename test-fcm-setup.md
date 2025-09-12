# FCM Testing Guide

## Step 1: Setup Two Test Accounts

### Account 1 (Emergency User):
1. Register/Login: `testuser1@example.com`
2. Add Account 2 as trusted contact
3. This user will trigger SOS

### Account 2 (Trusted Contact):
1. Register/Login: `testuser2@example.com` 
2. Add Account 1 as trusted contact
3. This user will receive notifications

## Step 2: Test Process

### On Device 1 (Account 1):
1. Login as `testuser1@example.com`
2. Go to Dashboard
3. Click "Trigger SOS" button
4. Check console for "SOS triggered successfully"

### On Device 2 (Account 2):
1. Login as `testuser2@example.com`
2. Keep browser tab open
3. Wait for notification
4. Check browser notifications

## Step 3: Check Notifications

### Foreground (Browser Tab Open):
- Notification appears in browser
- Check console for "Foreground notification received"

### Background (Browser Tab Closed):
- System notification appears
- Click to open app

## Troubleshooting

### If No Notifications:
1. Check browser notification permissions
2. Check console for FCM token errors
3. Verify both users have FCM tokens saved
4. Check backend logs for notification sending

### Console Commands:
```javascript
// Check FCM token
console.log('FCM Token:', localStorage.getItem('fcmToken'));

// Check notification permission
console.log('Notification Permission:', Notification.permission);

// Test notification manually
new Notification('Test', { body: 'This is a test' });
```
