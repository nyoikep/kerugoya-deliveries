// src/hooks/useFCM.ts
import { useEffect, useState } from 'react';
import { messaging } from '@/lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';

export function useFCM() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!messaging) return;

    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted' && messaging) { // Added messaging check
          // Get the FCM token
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY // You'll need to generate this in Firebase Console
          });

          if (currentToken) {
            setToken(currentToken);
            // Save token to your backend
            await saveTokenToBackend(currentToken);
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        }
      } catch (err) {
        console.log('An error occurred while retrieving token. ', err);
      }
    };

    requestPermission();

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      alert(`${payload.notification?.title}: ${payload.notification?.body}`);
    });

    return () => unsubscribe();
  }, []);

  return { token };
}

async function saveTokenToBackend(token: string) {
  const authToken = localStorage.getItem('token');
  if (!authToken) return;

  try {
    await fetch('/api/user/fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ fcmToken: token })
    });
  } catch (error) {
    console.error('Error saving FCM token to backend:', error);
  }
}
