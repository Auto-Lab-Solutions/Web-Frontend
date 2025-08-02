import { useEffect, useRef, useState } from 'react';
import React from 'react';

/**
 * A custom hook that automatically scrolls to the current step in a progress bar
 * @param {number} currentStep - The current step (1-based index)
 * @param {number} totalSteps - Total number of steps
 * @returns {Object} - Refs for the container and steps
 */
const useProgressBarScroll = (currentStep, totalSteps) => {
  const containerRef = useRef(null);
  const stepRefs = useRef([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize component and refs
  useEffect(() => {
    setIsInitialized(true);
    
    try {
      // Initialize step refs
      stepRefs.current = Array(totalSteps).fill().map((_, i) => {
        return stepRefs.current && i < stepRefs.current.length 
          ? stepRefs.current[i] 
          : React.createRef();
      });
    } catch (error) {
      console.error('Error initializing step refs:', error);
      stepRefs.current = Array(totalSteps).fill().map(() => React.createRef());
    }
    
    return () => {
      setIsInitialized(false);
    };
  }, [totalSteps]);
  
  // Scroll to the current step when component mounts or currentStep changes
  useEffect(() => {
    // Only run after component is fully mounted and refs are available
    if (!isInitialized || !containerRef.current) return;
    
    // Use a small delay to ensure the DOM has fully rendered
    const scrollTimeout = setTimeout(() => {
      try {
        if (!containerRef.current || !stepRefs.current[currentStep - 1]?.current) {
          console.warn('Container or step element ref not found');
          return;
        }
        
        const container = containerRef.current;
        const activeStepElement = stepRefs.current[currentStep - 1].current;
        
        // Get the scroll positions
        const containerRect = container.getBoundingClientRect();
        const activeStepRect = activeStepElement.getBoundingClientRect();
        
        // Calculate the scroll position to center the active step
        const scrollLeftPosition = (activeStepRect.left + activeStepElement.offsetWidth / 2) - 
                                   (containerRect.left + containerRect.width / 2);
        
        // Check if scrollTo is supported and use it safely
        if (typeof container.scrollTo === 'function') {
          // Smooth scroll to the position
          container.scrollTo({
            left: container.scrollLeft + scrollLeftPosition,
            behavior: 'smooth'
          });
        } else {
          // Fallback for browsers that don't support scrollTo
          container.scrollLeft = container.scrollLeft + scrollLeftPosition;
        }
      } catch (error) {
        console.error('Error scrolling to active step:', error);
      }
    }, 100); // Small delay to ensure DOM is ready
    
    return () => clearTimeout(scrollTimeout);
  }, [currentStep, isInitialized]);
  
  return { containerRef, stepRefs };
};

export default useProgressBarScroll;
