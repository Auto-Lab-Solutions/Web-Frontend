/**
 * Scroll polyfill for older browsers that don't support the scrollTo method
 * or the smooth behavior option. This ensures our progress bars scroll 
 * properly on all devices.
 */
(function() {
  // Feature detection
  const supportsScrollBehavior = 'scrollBehavior' in document.documentElement.style;

  // Add scrollTo polyfill if it doesn't exist
  if (!Element.prototype.scrollTo) {
    Element.prototype.scrollTo = function(options) {
      // Handle object-style arguments ({ left: x, top: y, behavior: 'smooth' })
      if (options && typeof options === 'object') {
        // For smooth behavior, we would implement animation here
        // but for now, just set the position immediately
        this.scrollLeft = options.left || 0;
        this.scrollTop = options.top || 0;
        return;
      }

      // Handle positional arguments (x, y)
      const left = arguments[0];
      const top = arguments[1];
      this.scrollLeft = left;
      this.scrollTop = top;
    };
  } 
  // If scrollTo exists but smooth behavior is not supported
  else if (!supportsScrollBehavior) {
    const originalScrollTo = Element.prototype.scrollTo;
    
    Element.prototype.scrollTo = function(options) {
      if (options && typeof options === 'object' && options.behavior === 'smooth') {
        // Simple animation for smooth scrolling
        const startLeft = this.scrollLeft;
        const startTop = this.scrollTop;
        const targetLeft = options.left || startLeft;
        const targetTop = options.top || startTop;
        const distanceLeft = targetLeft - startLeft;
        const distanceTop = targetTop - startTop;
        const duration = 300; // ms
        const startTime = performance.now();
        
        const animateScroll = (currentTime) => {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2; // Easing function
          
          this.scrollLeft = startLeft + distanceLeft * easeProgress;
          this.scrollTop = startTop + distanceTop * easeProgress;
          
          if (progress < 1) {
            window.requestAnimationFrame(animateScroll);
          }
        };
        
        window.requestAnimationFrame(animateScroll);
      } else {
        // Use the original scrollTo for non-smooth behavior
        originalScrollTo.apply(this, arguments);
      }
    };
  }
})();
