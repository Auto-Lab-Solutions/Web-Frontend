import { useState, useEffect, useRef } from 'react';

/**
 * Hook for managing welcome notification for first-time visitors
 * 
 * This hook shows a welcome notification to visitors who haven't seen it before.
 * It uses localStorage to track whether the notification has been shown to prevent
 * showing it multiple times.
 * 
 * @returns {Object} Object containing welcome notification state and handlers
 */
export const useWelcomeNotification = () => {
  const [showWelcomeNotification, setShowWelcomeNotification] = useState(false);
  const hasShownWelcome = useRef(false);
  
  const WELCOME_SHOWN_KEY = 'welcomeNotificationShown';

  useEffect(() => {
    // Only run once when the hook mounts
    if (hasShownWelcome.current) {
      return;
    }

    // Check if the welcome notification has been shown before
    const hasSeenWelcome = localStorage.getItem(WELCOME_SHOWN_KEY);
    
    if (!hasSeenWelcome) {
      // Small delay to ensure page has loaded
      const timer = setTimeout(() => {
        setShowWelcomeNotification(true);
        hasShownWelcome.current = true;
        
        // Mark as shown in localStorage to prevent showing again
        localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
      }, 2000); // 2 second delay after page load (notification will then stay for 30 seconds)

      return () => clearTimeout(timer);
    } else {
      hasShownWelcome.current = true;
    }
  }, []); // No dependencies - only run once on mount

  const handleDismissWelcome = () => {
    setShowWelcomeNotification(false);
  };

  const resetWelcomeNotification = () => {
    // Utility function for testing - removes the localStorage flag
    localStorage.removeItem(WELCOME_SHOWN_KEY);
    hasShownWelcome.current = false;
  };

  return {
    showWelcomeNotification,
    handleDismissWelcome,
    resetWelcomeNotification // For testing purposes
  };
};
