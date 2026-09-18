import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import apiClient from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem('jwtToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });

    localStorage.setItem('jwtToken', response.data.token);
    setUser(response.data.user);

    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await apiClient.post('/auth/register', {
      name,
      email,
      password
    });

    localStorage.setItem('jwtToken', response.data.token);
    setUser(response.data.user);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: Boolean(user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};