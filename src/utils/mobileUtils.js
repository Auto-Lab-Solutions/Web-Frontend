/**
 * Utility functions to handle mobile-specific behaviors
 */

/**
 * Prevents mobile browsers from zooming when focusing on input fields
 * This is achieved by temporarily disabling user scaling during focus/blur
 */
export const preventMobileZoomOnInput = () => {
  // Only apply on mobile devices
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (!isMobile) return;

  const viewport = document.querySelector('meta[name="viewport"]');
  const originalContent = viewport ? viewport.content : '';
  
  const disableZoom = () => {
    if (viewport) {
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
  };
  
  const enableZoom = () => {
    if (viewport) {
      // Restore original viewport or set a reasonable default
      viewport.content = originalContent || 'width=device-width, initial-scale=1.0';
    }
  };

  // Add event listeners to all input, textarea, and select elements
  const addInputListeners = () => {
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      input.addEventListener('focus', disableZoom, { passive: true });
      input.addEventListener('blur', enableZoom, { passive: true });
    });
  };

  // Initial setup
  addInputListeners();
  
  // Re-run when new elements are added to the DOM
  const observer = new MutationObserver(() => {
    addInputListeners();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return () => {
    observer.disconnect();
  };
};

/**
 * Sets minimum font size for inputs on mobile to prevent zoom
 */
export const setMobileInputFontSize = () => {
  const style = document.createElement('style');
  style.textContent = `
    @media screen and (max-width: 767px) {
      input, textarea, select {
        font-size: 16px !important;
      }
    }
  `;
  document.head.appendChild(style);
};

/**
 * Comprehensive mobile optimization setup
 */
export const initializeMobileOptimizations = () => {
  // Set font sizes
  setMobileInputFontSize();
  
  // Prevent zoom on input focus (commented out as we're using viewport meta tag approach)
  // return preventMobileZoomOnInput();
};
