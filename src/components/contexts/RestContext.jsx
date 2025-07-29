
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { RestClient } from '../../classes/RestClient';
import { API_CONFIG } from '../../config/env';

const RestContext = createContext(undefined);

export const RestProvider = ({ children }) => {
  const [restClient, setRestClient] = useState(null);

  const createRestClient = useCallback(() => {
    console.log('Creating RestClient with endpoint:', API_CONFIG.BASE_URL);
    const client = new RestClient(API_CONFIG.BASE_URL);
    setRestClient(client);
  }, []);

  const clearRestClient = useCallback(() => {
    console.log('Removing RestClient');
    setRestClient(null);
  }, []);

  useEffect(() => {
    createRestClient();
    return () => {
      clearRestClient();
    };
  }, []); // Remove dependencies to prevent infinite loop

  return (
    <RestContext.Provider
      value={{
        restEndpoint: API_CONFIG.BASE_URL,
        restClient,
        createRestClient,
        clearRestClient,
      }}
    >
      {children}
    </RestContext.Provider>
  );
};

export const useRestClient = () => {
  const context = useContext(RestContext);
  if (!context) throw new Error('useRestClient must be used within a RestProvider');
  return context;
};
