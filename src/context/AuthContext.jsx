import { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import * as authService from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const user = await authService.getCurrentUser();
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      const { user, token } = await authService.login(credentials);
      localStorage.setItem('token', token);
      setCurrentUser(user);
      toast.success('Logged in successfully');
      return true;
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const { user, token } = await authService.register(userData);
      localStorage.setItem('token', token);
      setCurrentUser(user);
      toast.success('Registered successfully');
      return true;
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    toast.info('Logged out');
  };

  const changePassword = async (passwordData) => {
    try {
      await authService.changePassword(passwordData);
      toast.success('Password updated successfully');
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to update password');
      return false;
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    changePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
