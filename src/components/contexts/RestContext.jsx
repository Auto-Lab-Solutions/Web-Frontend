import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { RestClient } from '../../classes/RestClient';

const envData = import.meta.env;
console.log('ENV:', envData);
const REST_ENDPOINT = import.meta.env.VITE_API_GATEWAY_BASE_URL;

const RestContext = createContext(undefined);

export const RestProvider = ({ children }) => {
  const [restClient, setRestClient] = useState(null);

  const createRestClient = useCallback(() => {
    console.log('Creating RestClient with endpoint:', REST_ENDPOINT);
    const client = new RestClient(REST_ENDPOINT);
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
        restEndpoint: REST_ENDPOINT,
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
