import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const verificationController = useRef(null);

  // Verify user on app load (server checks cookie)
  useEffect(() => {
    const controller = new AbortController();
    verificationController.current = controller;

    api.get('/auth/me', { signal: controller.signal })
      .then((res) => {
        setUser(res.data.data);
        localStorage.setItem('user', JSON.stringify(res.data.data));
      })
      .catch((error) => {
        if (error.code === 'ERR_CANCELED') return;
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    // A bootstrap /auth/me request may still be in flight when a user submits
    // the login form. Cancel it so its stale 401 cannot erase this session.
    verificationController.current?.abort();
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user } = res.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
