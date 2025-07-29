
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { RestClient } from '../../classes/RestClient';

const BASE_URL = 'http://localhost:3000/api'; // Default to local API if not set

const RestContext = createContext(undefined);

export const RestProvider = ({ children }) => {
  const [restClient, setRestClient] = useState(null);

  const createRestClient = useCallback(() => {
    console.log('Creating RestClient with endpoint:', BASE_URL);
    const client = new RestClient(BASE_URL);
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
