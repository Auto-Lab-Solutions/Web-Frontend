import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const GlobalDataContext = createContext();

const STORAGE_KEYS = {
  USER_ID: 'userId',
  USER_DATA: 'userData',
  MESSAGES: 'messages',
  STAFF_USER_TYPING: 'staffUserTyping',
  APPOINTMENT_FORM_DATA: 'appointmentFormData',
  ORDER_FORM_DATA: 'orderFormData',
};

export const GlobalDataProvider = ({ children }) => {
  const [userId, setUserId] = useState(() => {
    const storedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    return storedUserId ? JSON.parse(storedUserId) : null;
  });
  const [userData, setUserData] = useState(() => {
    const storedUserData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return storedUserData ? JSON.parse(storedUserData) : {};
  });
  const [messages, setMessages] = useState(() => {
    const storedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return storedMessages ? JSON.parse(storedMessages) : [];
  });
  const [staffUserTyping, setStaffUserTyping] = useState(() => {
    const storedTyping = localStorage.getItem(STORAGE_KEYS.STAFF_USER_TYPING);
    return storedTyping ? JSON.parse(storedTyping) : false;
  });
  const [appointmentFormData, setAppointmentFormData] = useState(() => {
    const storedData = localStorage.getItem(STORAGE_KEYS.APPOINTMENT_FORM_DATA);
    return storedData ? JSON.parse(storedData) : {};
  });
  const [orderFormData, setOrderFormData] = useState(() => {
    const storedData = localStorage.getItem(STORAGE_KEYS.ORDER_FORM_DATA);
    return storedData ? JSON.parse(storedData) : {};
  });

  const updateUserId = (id) => {
    setUserId(id);
    localStorage.setItem(STORAGE_KEYS.USER_ID, JSON.stringify(id));
  };

  const updateUserData = (userData) => {
    setUserData(userData);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  };

  const updateMessages = (newMessages) => {
    setMessages(newMessages);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(newMessages));
  };

  const updateStaffUserTyping = (isTyping) => {
    setStaffUserTyping(isTyping);
    localStorage.setItem(STORAGE_KEYS.STAFF_USER_TYPING, JSON.stringify(isTyping));
  };

  const updateAppointmentFormData = (data) => {
    setAppointmentFormData(data);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENT_FORM_DATA, JSON.stringify(data));
  };

  const updateOrderFormData = (data) => {
    setOrderFormData(data);
    localStorage.setItem(STORAGE_KEYS.ORDER_FORM_DATA, JSON.stringify(data));
  };

  const clearUserData = () => {
    setUserId(null);
    setUserData({});
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  };

  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  };

  const clearStaffUserTyping = () => {
    setStaffUserTyping(false);
    localStorage.removeItem(STORAGE_KEYS.STAFF_USER_TYPING);
  };

  const clearFormData = () => {
    // Reset to empty objects, not undefined
    setAppointmentFormData({});
    setOrderFormData({items: []});
    localStorage.removeItem(STORAGE_KEYS.APPOINTMENT_FORM_DATA);
    localStorage.removeItem(STORAGE_KEYS.ORDER_FORM_DATA);
  };

  const contextValue = useMemo(() => ({
    userId,
    userData,
    messages,
    staffUserTyping,
    appointmentFormData,
    orderFormData,
    updateUserId,
    updateUserData,
    updateMessages,
    updateStaffUserTyping,
    updateAppointmentFormData,
    updateOrderFormData,
    clearUserData,
    clearMessages,
    clearStaffUserTyping,
    clearFormData,
  }), [
    userId, userData, messages, staffUserTyping, 
    appointmentFormData, orderFormData
  ]);

  return (
    <GlobalDataContext.Provider value={contextValue}>
      {children}
    </GlobalDataContext.Provider>
  );
  
};

export const useGlobalData = () => {
  const context = useContext(GlobalDataContext);
  if (!context) {
    throw new Error('useGlobalData must be used within a GlobalDataProvider');
  }
  return context;
}

