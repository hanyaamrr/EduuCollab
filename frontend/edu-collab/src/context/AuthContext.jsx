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
        // USE THE SHORT NAMES FROM YOUR CONSOLE!
        setUser({
          id: decoded.nameid,
          email: decoded.email,
          name: decoded.unique_name,
          role: decoded.role,
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

    // Grab the role using the short name
    const role = decoded.role;

    // Set the user using the short names
    setUser({
      id: decoded.nameid,
      email: decoded.email,
      name: decoded.unique_name,
      role: role,
    });

    // Return the role so Login.jsx can use it!
    return role;
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