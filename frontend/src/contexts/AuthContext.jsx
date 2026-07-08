import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { ROLES } from '../constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    const { accessToken, refreshToken, userId, fullName, email, role } = response.data.data;
    const userData = { id: userId, fullName, email, role };
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const response = await authService.register(data);
    return response.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (role) => user?.role === role,
    [user]
  );

  const isAuthenticated = !!user;
  const isAdmin = user?.role === ROLES.ADMIN;
  const isFarmer = user?.role === ROLES.FARMER;
  const isWorker = user?.role === ROLES.WORKER;
  const isEquipmentOwner = user?.role === ROLES.EQUIPMENT_OWNER;
  const isBuyer = user?.role === ROLES.BUYER;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        hasRole,
        isAuthenticated,
        isAdmin,
        isFarmer,
        isWorker,
        isEquipmentOwner,
        isBuyer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
