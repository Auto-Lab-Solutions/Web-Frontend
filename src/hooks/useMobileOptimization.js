import { useEffect } from 'react';

/**
 * Custom hook to prevent mobile zoom on input focus
 * Use this hook in components that contain form inputs
 */
export const useMobileZoomPrevention = () => {
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (!isMobile) return;

    const viewport = document.querySelector('meta[name="viewport"]');
    const originalContent = viewport?.content || '';
    
    const handleFocus = () => {
      if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      }
    };
    
    const handleBlur = () => {
      // Add a small delay to prevent flashing
      setTimeout(() => {
        if (viewport && !document.activeElement?.matches('input, textarea, select')) {
          viewport.content = originalContent || 'width=device-width, initial-scale=1.0';
        }
      }, 100);
    };

    // Add event listeners to all inputs in the current component
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      input.addEventListener('focus', handleFocus, { passive: true });
      input.addEventListener('blur', handleBlur, { passive: true });
    });

    // Cleanup
    return () => {
      inputs.forEach(input => {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      });
    };
  }, []);
};

/**
 * Hook to ensure inputs have minimum font size on mobile
 */
export const useMobileInputStyling = () => {
  useEffect(() => {
    const styleId = 'mobile-input-styling';
    
    // Check if style already exists
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @media screen and (max-width: 767px) {
        input:not([type="checkbox"]):not([type="radio"]), 
        textarea, 
        select {
          font-size: 16px !important;
          /* Ensure proper height is maintained */
          line-height: 1.5 !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Cleanup
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);
};
