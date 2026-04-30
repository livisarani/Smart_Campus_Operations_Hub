import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
const AuthContext = createContext(null);

const normalizeUser = (u) => {
  if (!u) return null;
  const resolvedRole = u.role || (Array.isArray(u.roles) && u.roles.length ? u.roles[0] : 'USER');
  const resolvedName = u.fullName || u.name || u.username || u.email || 'User';
  const resolvedUsername = u.username || (u.email ? String(u.email).split('@')[0] : resolvedName);
  return {
    ...u,
    fullName: resolvedName,
    name: resolvedName,
    username: resolvedUsername,
    role: resolvedRole,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token') || localStorage.getItem('accessToken') || null;
    const savedUser = localStorage.getItem('user');
    const legacyEmail = localStorage.getItem('userEmail');
    const legacyName = localStorage.getItem('userName');
    const legacyRole = localStorage.getItem('userRole');

    const hydrate = async () => {
      if (savedToken) {
        setToken(savedToken);
        axios.defaults.headers.common.Authorization = `Bearer ${savedToken}`;

        if (savedUser) {
          try {
            setUser(normalizeUser(JSON.parse(savedUser)));
            setLoading(false);
            return;
          } catch {
            localStorage.removeItem('user');
          }
        }

        try {
          const { data } = await axios.get('/api/auth/me');
          const normalized = normalizeUser(data);
          setUser(normalized);
          localStorage.setItem('user', JSON.stringify(normalized));
          if (normalized.email) localStorage.setItem('userEmail', normalized.email);
          if (normalized.fullName) localStorage.setItem('userName', normalized.fullName);
          if (normalized.role) localStorage.setItem('userRole', normalized.role);
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common.Authorization;
        }
      }

      if (legacyEmail) {
        setUser(normalizeUser({
          email: legacyEmail,
          name: legacyName || legacyEmail,
          fullName: legacyName || legacyEmail,
          username: legacyEmail.split('@')[0],
          role: legacyRole || 'USER',
        }));
      }

      setLoading(false);
    };

    hydrate();
  }, []);

  const login = useCallback((arg1, arg2, arg3) => {
    if (typeof arg1 === 'object' && arg1 !== null) {
      const { token: t, accessToken, ...userData } = arg1;
      const resolvedToken = t || accessToken || null;

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      const legacyEmail = userData.email || userData.username || '';
      const legacyName = userData.fullName || userData.name || userData.username || '';
      const legacyRole = userData.role || 'USER';

      if (legacyEmail) localStorage.setItem('userEmail', legacyEmail);
      if (legacyName) localStorage.setItem('userName', legacyName);
      if (legacyRole) localStorage.setItem('userRole', legacyRole);

      if (resolvedToken) {
        setToken(resolvedToken);
        localStorage.setItem('token', resolvedToken);
        localStorage.setItem('accessToken', resolvedToken);
        axios.defaults.headers.common.Authorization = `Bearer ${resolvedToken}`;
      } else {
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        delete axios.defaults.headers.common.Authorization;
      }

      return;
    }

    const email = arg1;
    const name = arg2;
    const role = arg3 || 'USER';
    const userData = {
      email,
      name,
      fullName: name,
      username: email ? String(email).split('@')[0] : name,
      role,
    };

    setUser(userData);
    setToken(null);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.removeItem('token');
    localStorage.setItem('userEmail', email || '');
    localStorage.setItem('userName', name || '');
    localStorage.setItem('userRole', role);
    delete axios.defaults.headers.common.Authorization;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    delete axios.defaults.headers.common.Authorization;
  }, []);

  useEffect(() => {
    const reqInterceptor = axios.interceptors.request.use((config) => {
      const t = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (t) config.headers.Authorization = `Bearer ${t}`;
      return config;
    });

    const resInterceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) logout();
        return Promise.reject(err);
      }
    );
    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, [logout]);

  const isAdmin = user?.role === 'ADMIN' || user?.roles?.includes?.('ADMIN');
  const isTechnician = user?.role === 'TECHNICIAN' || user?.roles?.includes?.('TECHNICIAN');
  const isAuthenticated = !!user;

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        token,
        login,
        logout,
        loading,
        isAdmin,
        isTechnician,
        isAuthenticated,
      },
    },
    children
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
