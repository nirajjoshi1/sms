import React, { createContext, useContext, useState, useEffect } from 'react';

const LoadingContext = createContext(null);

export const LoadingProvider = ({ children }) => {
  const [activeMutations, setActiveMutations] = useState(0);

  useEffect(() => {
    const handleStart = () => setActiveMutations(prev => prev + 1);
    const handleEnd = () => setActiveMutations(prev => Math.max(0, prev - 1));

    window.addEventListener('mutation:start', handleStart);
    window.addEventListener('mutation:end', handleEnd);

    return () => {
      window.removeEventListener('mutation:start', handleStart);
      window.removeEventListener('mutation:end', handleEnd);
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading: activeMutations > 0 }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider');
  return ctx;
};
