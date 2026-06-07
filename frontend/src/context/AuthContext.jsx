import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE = 'http://localhost:8000/api/v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const mockUsers = {
    'admin@talentai.com': { name: 'Super Admin', email: 'admin@talentai.com', role: 'Management Admin' },
    'recruiter@talentai.com': { name: 'Michael Chang', email: 'recruiter@talentai.com', role: 'HR Recruiter' },
    'employee@talentai.com': { name: 'Alice Smith', email: 'employee@talentai.com', role: 'Employee' },
    'candidate@talentai.com': { name: 'Jane Doe', email: 'candidate@talentai.com', role: 'Candidate' }
  };

  useEffect(() => {
    async function loadMe() {
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
            setOfflineMode(false);
          } else {
            // Token expired or invalid
            logout();
          }
        } catch (e) {
          console.warn("Backend unreachable. Enabling offline mock mode for token.");
          setOfflineMode(true);
          // Look up user based on stored email if any
          const storedEmail = localStorage.getItem('user_email') || 'manager@talentai.com';
          setUser(mockUsers[storedEmail] || mockUsers['manager@talentai.com']);
        }
      }
      setLoading(false);
    }
    loadMe();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user_email', data.user.email);
        setToken(data.access_token);
        setUser(data.user);
        setOfflineMode(false);
        return { success: true };
      } else {
        const errorData = await res.json();
        return { success: false, error: errorData.detail || 'Invalid credentials' };
      }
    } catch (e) {
      console.warn("Backend connection failed. Executing offline fallback login.");
      // Offline fallback login for demo
      const matched = mockUsers[email.toLowerCase()];
      if (matched && password === 'password123') {
        const fakeToken = `fake-jwt-token-for-${matched.role}`;
        localStorage.setItem('token', fakeToken);
        localStorage.setItem('user_email', matched.email);
        setToken(fakeToken);
        setUser(matched);
        setOfflineMode(true);
        return { success: true };
      }
      return { success: false, error: 'Cannot connect to server. Use registered emails with password123 (e.g. manager@talentai.com / password123)' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_email');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, offlineMode, login, logout }}>
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
