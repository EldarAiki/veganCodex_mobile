import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          // If we have a token but no user data, clear everything
          await AsyncStorage.removeItem('token');
        }
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      // Clear potentially corrupted data
      await AsyncStorage.multiRemove(['token', 'user']);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      console.log('Attempting login with:', credentials);
      const response = await authAPI.login(credentials);
      console.log('Login response:', response.data);
      
      // Validate response data
      if (!response.data || !response.data.token) {
        throw new Error('Invalid response: Missing token');
      }

      const userData = {
        _id: response.data._id,
        email: response.data.email,
        username: response.data.username
      };
      const token = response.data.token;

      // Store token first
      await AsyncStorage.setItem('token', token);
      
      // Then store user data
      const userString = JSON.stringify(userData);
      await AsyncStorage.setItem('user', userString);
      
      setUser(userData);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.data) {
        console.error('Server error response:', err.response.data);
      }
      setError(err.message || 'Login failed. Please check your credentials.');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      console.log('Attempting registration with:', userData);
      const response = await authAPI.register(userData);
      console.log('Registration response:', response.data);
      
      const { token, user: newUser } = response.data;
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      
      setUser(newUser);
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      return false;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local storage and state regardless of server response
      await AsyncStorage.multiRemove(['token', 'user']);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 