/**
 * Development utilities for testing the welcome notification
 * These functions can be called from the browser console during development
 * 
 * Welcome Notification Duration: 30 seconds with visual countdown
 */

// Add development utilities to window object for easy testing
if (typeof window !== 'undefined') {
  window.devUtils = {
    /**
     * Reset welcome notification - it will show again on next page load for first-time visitors
     * Note: Welcome notification now displays for 30 seconds with progress bar
     */
    resetWelcomeNotification: () => {
      localStorage.removeItem('welcomeNotificationShown');
    },

    /**
     * Clear all user data including userId to simulate first-time visitor
     * The welcome notification will appear for 30 seconds with visual countdown
     */
    simulateFirstTimeVisitor: () => {
      localStorage.removeItem('welcomeNotificationShown');
      console.log('🆕 Simulated first-time visitor - refresh page to see 30-second welcome notification');
      console.log('ℹ️ Note: Welcome notification now only depends on welcomeNotificationShown flag');
    },

    /**
     * Set userId to simulate returning visitor
     */
    simulateReturningVisitor: () => {
      localStorage.setItem('welcomeNotificationShown', 'true');
      console.log('👤 Simulated returning visitor - welcome notification should not show');
      console.log('ℹ️ Note: Welcome notification now only depends on welcomeNotificationShown flag');
    },

    /**
     * Check current user state
     */
    checkUserState: () => {
      const userId = localStorage.getItem('userId');
      const welcomeShown = localStorage.getItem('welcomeNotificationShown');
      console.log('👤 Current user state:', {
        userId: userId ? JSON.parse(userId) : null,
        welcomeShown: welcomeShown === 'true',
        willShowWelcome: !welcomeShown
      });
      console.log('ℹ️ Welcome notification duration: 30 seconds with progress bar');
      console.log('ℹ️ Note: Welcome notification now only depends on welcomeNotificationShown flag');
    },

    /**
     * Information about welcome notification timing
     */
    getWelcomeNotificationInfo: () => {
      console.log('📋 Welcome Notification Information:');
      console.log('   • Trigger: Visitors who haven\'t seen it before (welcomeNotificationShown flag)');
      console.log('   • Delay: 2 seconds after page load');
      console.log('   • Duration: 30 seconds with visual countdown');
      console.log('   • Progress bar: Updates every second');
      console.log('   • Manual dismiss: "Later" or X button');
      console.log('   • Action button: "View Inspections" (navigates to /inspections)');
      console.log('   • Note: No longer depends on userId - simpler logic');
    }
  };

  console.log('🛠️ Development utilities loaded. Available commands:');
  console.log('- devUtils.resetWelcomeNotification()');
  console.log('- devUtils.simulateFirstTimeVisitor()');
  console.log('- devUtils.simulateReturningVisitor()');
  console.log('- devUtils.checkUserState()');
  console.log('- devUtils.getWelcomeNotificationInfo()');
  console.log('📋 Welcome notification now displays for 30 seconds with progress bar!');
}

export default {};
