import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('carepulse_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('carepulse_token'));
  const [loading, setLoading] = useState(true);

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem('carepulse_token');
    localStorage.removeItem('carepulse_user');
    setToken(null);
    setUser(null);
  }, []);

  // Sync / verify profile on load
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('carepulse_token');
      if (savedToken) {
        try {
          const res = await authService.getProfile();
          if (res?.data) {
            setUser(res.data);
            localStorage.setItem('carepulse_user', JSON.stringify(res.data));
          }
        } catch (err) {
          // If token verification fails, clear auth
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for unauthorized 401 events from axios interceptor
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  // Login
  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('carepulse_token', newToken);
    localStorage.setItem('carepulse_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return res;
  };

  // Register
  const register = async (userData) => {
    const res = await authService.register(userData);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('carepulse_token', newToken);
    localStorage.setItem('carepulse_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return res;
  };

  const hasRole = useCallback((...allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  }, [user]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    hasRole,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
