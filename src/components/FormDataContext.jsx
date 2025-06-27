import React, { createContext, useContext, useState, useEffect } from 'react';

const FormDataContext = createContext();

export const FormDataProvider = ({ children }) => {
  const [formData, setFormData] = useState(() => {
    // Optional: load from localStorage
    const saved = localStorage.getItem('multiPageFormData');
    return saved ? JSON.parse(saved) : {};
  });

  const getFormData = () => {
    const saved = localStorage.getItem('multiPageFormData');
    return saved ? JSON.parse(saved) : {};
  };

  const updateFormData = (newData) => {
    setFormData((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('multiPageFormData', JSON.stringify(updated));
      return updated;
    });
  };

  const clearFormData = () => {
    setFormData({});
    localStorage.removeItem('multiPageFormData');
  };

  return (
    <FormDataContext.Provider value={{ formData, getFormData, updateFormData, clearFormData }}>
      {children}
    </FormDataContext.Provider>
  );
};

export const useFormData = () => useContext(FormDataContext);

