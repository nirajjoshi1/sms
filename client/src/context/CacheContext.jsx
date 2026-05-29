import React, { createContext, useContext, useState, useRef } from 'react';

const CacheContext = createContext();

export const CacheProvider = ({ children }) => {
  const [cache, setCache] = useState({});
  const cacheTimeouts = useRef({});

  const setItem = (key, value, ttl = 5 * 60 * 1000) => { // Default 5 minutes TTL
    setCache(prev => ({ ...prev, [key]: { value, timestamp: Date.now() } }));

    // Clear existing timeout
    if (cacheTimeouts.current[key]) {
      clearTimeout(cacheTimeouts.current[key]);
    }

    // Set new timeout to invalidate cache
    cacheTimeouts.current[key] = setTimeout(() => {
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[key];
        return newCache;
      });
      delete cacheTimeouts.current[key];
    }, ttl);
  };

  const getItem = (key) => {
    return cache[key]?.value || null;
  };

  const invalidate = (key) => {
    setCache(prev => {
      const newCache = { ...prev };
      delete newCache[key];
      return newCache;
    });
    if (cacheTimeouts.current[key]) {
      clearTimeout(cacheTimeouts.current[key]);
      delete cacheTimeouts.current[key];
    }
  };

  const invalidatePattern = (pattern) => {
    const regex = new RegExp(pattern);
    setCache(prev => {
      const newCache = { ...prev };
      Object.keys(newCache).forEach(key => {
        if (regex.test(key)) {
          delete newCache[key];
          if (cacheTimeouts.current[key]) {
            clearTimeout(cacheTimeouts.current[key]);
            delete cacheTimeouts.current[key];
          }
        }
      });
      return newCache;
    });
  };

  const clearAll = () => {
    setCache({});
    Object.values(cacheTimeouts.current).forEach(timeout => clearTimeout(timeout));
    cacheTimeouts.current = {};
  };

  return (
    <CacheContext.Provider value={{ setItem, getItem, invalidate, invalidatePattern, clearAll }}>
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within CacheProvider');
  }
  return context;
};
