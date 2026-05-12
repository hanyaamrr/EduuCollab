import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Session Persistence on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Map .NET claims to a usable React user object
        setUser({
          id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
          email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
          name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
          role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        });
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const response = await api.post('/login', credentials);
    const { token } = response.data;
    localStorage.setItem('token', token);
    
    const decoded = jwtDecode(token);
    setUser({
      id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};