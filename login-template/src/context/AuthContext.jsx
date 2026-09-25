import { useState, useCallback, createContext, useContext } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY_TOKEN = 'cv_token';
const STORAGE_KEY_USER = 'cv_user';
const STORAGE_KEY_PENDING = 'cv_pending_verification';

function loadStoredAuth() {
  try {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const userRaw = localStorage.getItem(STORAGE_KEY_USER);
    if (token && userRaw) {
      return { token, user: JSON.parse(userRaw) };
    }
  } catch {
    // corrupt storage, ignore
  }
  return { token: null, user: null };
}

function loadPendingVerification() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PENDING);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const initial = loadStoredAuth();
  const initialPending = loadPendingVerification();
  const [token, setToken] = useState(initial.token);
  const [user, setUser] = useState(initial.user);
  const [pendingVerification, setPendingVerificationState] = useState(initialPending);

  const isAuthenticated = Boolean(token);

  const saveAuth = useCallback((newToken, newUser) => {
    localStorage.setItem(STORAGE_KEY_TOKEN, newToken);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const login = useCallback((data) => {
    saveAuth(data.token, data.user);
  }, [saveAuth]);

  const register = useCallback((data) => {
    if (data.token) {
      saveAuth(data.token, data.user);
    } else {
      setUser(data.user ?? null);
    }
  }, [saveAuth]);

  const setPendingVerification = useCallback((info) => {
    if (info) {
      localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(info));
    } else {
      localStorage.removeItem(STORAGE_KEY_PENDING);
    }
    setPendingVerificationState(info);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_PENDING);
    setToken(null);
    setUser(null);
    setPendingVerificationState(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      token, user, isAuthenticated,
      pendingVerification, setPendingVerification,
      login, register, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
