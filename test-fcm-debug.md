# FCM Debug Guide - Navi Shakti

## Issues Fixed:

### 1. ✅ VAPID Key Configuration
- Added proper VAPID key in `firebase.js`
- Updated `env.example` with VAPID key configuration

### 2. ✅ Service Worker Registration
- Fixed `firebase-messaging-sw.js` with proper Firebase initialization
- Added proper error handling

### 3. ✅ Manifest.json Configuration
- Added `gcm_sender_id` to manifest.json
- This is required for FCM to work properly

### 4. ✅ Client-side Notification Handling
- Enhanced foreground message handling
- Added proper browser notification display
- Integrated notification setup with login flow

### 5. ✅ Environment Variables
- Updated `env.example` with proper Firebase configuration
- Added VAPID key configuration

## Testing Steps:

### Step 1: Environment Setup
1. Copy `env.example` to `.env`
2. Update Firebase credentials in `.env`:
   ```
   FIREBASE_PROJECT_ID=nari-sakti
   FIREBASE_PRIVATE_KEY="your-actual-private-key"
   FIREBASE_CLIENT_EMAIL="your-service-account-email"
   REACT_APP_VAPID_KEY="your-vapid-key"
   ```

### Step 2: Get VAPID Key
1. Go to Firebase Console → Project Settings → Cloud Messaging
2. Scroll down to "Web configuration"
3. Click "Generate key pair" if not exists
4. Copy the key and update in `.env`

### Step 3: Test Notifications
1. Start the server: `npm start` (in root directory)
2. Start the client: `cd client && npm start`
3. Login to the app
4. Go to Test Notifications page
5. Click "Setup Notifications" - should get FCM token
6. Click "Send Test Notification" - should receive notification

### Step 4: Debug Console
Check browser console for:
- FCM token generation
- Notification permission status
- Service worker registration
- Message reception logs

## Common Issues & Solutions:

### Issue: "No FCM token available"
**Solution:** 
- Check VAPID key is correct
- Ensure service worker is registered
- Check browser notification permission

### Issue: "Service worker not registered"
**Solution:**
- Check `firebase-messaging-sw.js` is in `/public` folder
- Verify service worker URL is correct
- Check browser console for errors

### Issue: "Notifications not showing"
**Solution:**
- Check notification permission is granted
- Verify FCM token is saved to backend
- Check service worker is active
- Test with browser notification API directly

### Issue: "Firebase Admin SDK not initialized"
**Solution:**
- Check environment variables are set
- Verify Firebase service account credentials
- Check server logs for initialization errors

## Testing Commands:

```bash
# Test notification endpoint
curl -X POST http://localhost:5000/api/test-notification \
  -H "Content-Type: application/json" \
  -d '{"fcmToken":"your-fcm-token-here"}'

# Check server health
curl http://localhost:5000/health
```

## Expected Flow:
1. User logs in → FCM token generated → Saved to backend
2. SOS triggered → Backend sends notification via FCM
3. Service worker receives notification → Shows browser notification
4. User sees notification → Can click to view details

## Debug Checklist:
- [ ] VAPID key configured
- [ ] Service worker registered
- [ ] FCM token generated
- [ ] Token saved to backend
- [ ] Notification permission granted
- [ ] Firebase Admin SDK initialized
- [ ] Test notification sent successfully
- [ ] Browser notification displayed
