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
 * Hook to ensure inputs have minimum font size on mobile and improve touch targets
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
        select,
        [role="combobox"],
        .mobile-touch-target {
          font-size: 16px !important;
          min-height: 44px !important;
          padding: 0.5rem !important;
          /* Ensure proper height is maintained */
          line-height: 1.5 !important;
        }
        
        /* Increase spacing between form elements */
        .form-field, 
        .form-group,
        .input-wrapper,
        .form-control-container,
        div:has(> input:not([type="checkbox"]):not([type="radio"])),
        div:has(> textarea),
        div:has(> select) {
          margin-bottom: 1rem !important;
        }
        
        /* Make buttons more touch-friendly */
        button,
        .button,
        [type="button"],
        [type="submit"],
        [type="reset"] {
          min-height: 44px !important;
        }
        
        /* Quantity controls specifically for the cart */
        .quantity-control {
          min-width: 44px !important;
          min-height: 44px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Apply more specific styles directly to DOM elements
    const applyMobileOptimizations = () => {
      if (window.innerWidth <= 767) {
        // Target all form controls and quantity selectors
        const formElements = document.querySelectorAll('input, select, textarea, [role="combobox"]');
        const quantityControls = document.querySelectorAll('.quantity-input, .quantity-button');
        
        formElements.forEach(el => {
          if (!el.classList.contains('mobile-optimized')) {
            el.classList.add('mobile-optimized');
          }
        });
        
        quantityControls.forEach(el => {
          if (!el.classList.contains('quantity-control')) {
            el.classList.add('quantity-control');
          }
        });
      }
    };
    
    // Apply immediately and on resize
    applyMobileOptimizations();
    window.addEventListener('resize', applyMobileOptimizations);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', applyMobileOptimizations);
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);
};
