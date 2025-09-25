import { useCallback, useEffect, useRef } from 'react';
import { useGlobalData } from '../components/contexts/GlobalDataContext';
import { useRestClient } from '../components/contexts/RestContext';
import { useWebSocket } from '../components/contexts/WebSocketContext';
import { validateAndClearIfInvalid } from '../utils/userValidationUtils';

/**
 * Hook for handling user validation on app startup
 * 
 * This hook validates the stored userId with the backend API ONCE when the app loads.
 * It reads the userId directly from localStorage to avoid triggering on state changes.
 * If the userId is invalid, it clears all user-related data and triggers WebSocket reconnection.
 * The validation runs only once per app session to prevent multiple API calls.
 * 
 * @returns {Object} Object containing performValidation function for manual validation
 */
export const useUserValidation = () => {
  const { clearAllUserData } = useGlobalData();
  const { restClient } = useRestClient();
  const { reconnectWebSocket } = useWebSocket();
  const hasValidated = useRef(false);

  const performValidation = useCallback(async () => {
    if (hasValidated.current || !restClient) {
      return;
    }

    // Get the initial userId directly from localStorage to avoid state dependencies
    const storedUserId = localStorage.getItem('userId');
    const initialUserId = storedUserId ? JSON.parse(storedUserId) : null;

    // If there's no initial userId, no need to validate
    if (!initialUserId) {
      hasValidated.current = true; // Mark as validated to prevent future runs
      return;
    }

    hasValidated.current = true; // Mark as validated immediately to prevent multiple calls

    try {
      const isValid = await validateAndClearIfInvalid(
        initialUserId,
        restClient,
        clearAllUserData
      );

      if (isValid) {
        console.log('✅ User validation completed - userId is valid');
        // No need to reconnect WebSocket if userId is valid
      } else {
        console.log('🗑️ User validation completed - invalid userId cleared');
        
        // Only trigger WebSocket reconnection when userId is actually invalid
        // The backend creates users if they don't exist, so this should be rare
        console.log('🔄 Triggering WebSocket reconnection to obtain new userId from backend');
        setTimeout(() => {
          reconnectWebSocket();
        }, 1000);
      }
    } catch (error) {
      console.error('❗ Error during user validation:', error);
      // On error, don't automatically reconnect unless we're sure the userId is invalid
    }
  }, [restClient, clearAllUserData, reconnectWebSocket]);

  // Only run validation when restClient becomes available
  useEffect(() => {
    if (restClient && !hasValidated.current) {
      performValidation();
    }
  }, [restClient, performValidation]);

  return {
    performValidation
  };
};
