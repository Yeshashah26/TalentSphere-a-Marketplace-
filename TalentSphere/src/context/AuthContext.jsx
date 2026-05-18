import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../lib/api';

const AuthContext = createContext(null);

const SESSION_KEY = 'talentsphere_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileVersion, setProfileVersion] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProfile = useCallback(async (u) => {
    if (!u) {
      setProfile(null);
      return;
    }
    if (u.role === 'candidate') {
      setProfile(await api.getCandidate(u.id));
    } else if (u.role === 'company') {
      setProfile(await api.getCompany(u.id));
    } else {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    loadProfile(user);
  }, [user, profileVersion, loadProfile]);

  useEffect(() => {
    const onUpdate = () => setProfileVersion((v) => v + 1);
    window.addEventListener('talentsphere-update', onUpdate);
    return () => window.removeEventListener('talentsphere-update', onUpdate);
  }, []);

  const persist = useCallback((u) => {
    if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else localStorage.removeItem(SESSION_KEY);
    setUser(u);
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await api.loginUser(email, password);
    persist(u);
    return u;
  }, [persist]);

  const logout = useCallback(() => persist(null), [persist]);

  const register = useCallback(async (data) => {
    const u = await api.registerUser(data);
    persist(u);
    return u;
  }, [persist]);

  const refreshProfile = useCallback(() => {
    setProfileVersion((v) => v + 1);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, register, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
