import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('echofy_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('echofy_token');
      if (token) {
        try {
          const res = await api.get('/auth/me.php');
          if (res.data.status) {
            setUser(res.data.data.user);
            localStorage.setItem('echofy_user', JSON.stringify(res.data.data.user));
          } else {
            logout();
          }
        } catch (err) {
          console.error("Auth session check failed:", err);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const sendVerificationCode = async (email, type = 'register', role = 'listener') => {
    try {
      const res = await api.post('/auth/send-code.php', { email, type, role });
      if (res.data.status) {
        return {
          success: true,
          message: res.data.message,
          debugCode: res.data.data?.debug_code
        };
      }
      return { success: false, message: res.data.message || 'Failed to send verification code' };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error sending verification code';
      return { success: false, message: errorMsg };
    }
  };

  const verifyCode = async (email, code, type = 'register') => {
    try {
      const res = await api.post('/auth/verify-code.php', { email, code, type });
      if (res.data.status) {
        return {
          success: true,
          message: res.data.message
        };
      }
      return { success: false, message: res.data.message || 'Invalid verification code' };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Verification error';
      return { success: false, message: errorMsg };
    }
  };

  const login = async (email, password, role = 'listener') => {
    try {
      const res = await api.post('/auth/login.php', { email, password, role });
      if (res.data.status) {
        const { token, user: userData } = res.data.data;
        localStorage.setItem('echofy_token', token);
        localStorage.setItem('echofy_user', JSON.stringify(userData));
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Invalid email or password';
      return { success: false, message: errorMsg };
    }
  };

  const register = async (name, email, password, role = 'listener', code = '', biography = '') => {
    try {
      const res = await api.post('/auth/register.php', { name, email, password, role, code, biography });
      if (res.data.status) {
        const { token, user: userData } = res.data.data;
        localStorage.setItem('echofy_token', token);
        localStorage.setItem('echofy_user', JSON.stringify(userData));
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Registration error';
      return { success: false, message: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout.php');
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('echofy_token');
    localStorage.removeItem('echofy_user');
    setUser(null);
  };

  const updateUser = (newUserData) => {
    const updated = { ...user, ...newUserData };
    setUser(updated);
    localStorage.setItem('echofy_user', JSON.stringify(updated));
  };

  const isArtist = user?.role === 'artist' || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        sendVerificationCode,
        verifyCode,
        login,
        register,
        logout,
        updateUser,
        isArtist,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
