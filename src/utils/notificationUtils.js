/**
 * Utility functions for notification handling
 */

/**
 * Play a subtle notification sound
 * Uses Web Audio API to create a pleasant notification sound
 */
export const playNotificationSound = () => {
  try {
    // Check if user has interacted with the page (required for audio)
    if (typeof window !== 'undefined' && window.AudioContext) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create a pleasant two-tone notification sound
      const createTone = (frequency, startTime, duration) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = 'sine';
        
        // Smooth envelope for pleasant sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
        
        return oscillator;
      };
      
      const now = audioContext.currentTime;
      
      // First tone (higher frequency)
      createTone(800, now, 0.15);
      
      // Second tone (lower frequency, slightly delayed)
      createTone(600, now + 0.1, 0.2);
      
    } else {
      // Fallback: try to use a simple beep if Web Audio API is not available
      console.log('🔔 Notification sound would play here');
    }
  } catch (error) {
    // Silently fail if audio is not supported or blocked
    console.debug('Notification sound not available:', error.message);
  }
};

/**
 * Check if notifications are enabled/allowed
 */
export const isNotificationSoundEnabled = () => {
  // Check localStorage for user preference
  const soundEnabled = localStorage.getItem('notificationSoundEnabled');
  return soundEnabled === null || soundEnabled === 'true'; // Default to enabled
};

/**
 * Toggle notification sound preference
 */
export const toggleNotificationSound = () => {
  const current = isNotificationSoundEnabled();
  localStorage.setItem('notificationSoundEnabled', !current);
  return !current;
};

/**
 * Request notification permission (for future browser notifications)
 */
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

/**
 * Show browser notification (if permission granted)
 */
export const showBrowserNotification = (title, message, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body: message,
      icon: '/vite.svg', // Use your app icon
      badge: '/vite.svg',
      tag: 'new-message', // Replace previous notifications with same tag
      requireInteraction: false,
      silent: false,
      ...options
    });
    
    // Auto-close after 4 seconds
    setTimeout(() => {
      notification.close();
    }, 4000);
    
    return notification;
  }
  return null;
};