import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService, RegisterRequest } from '../services/authService';
import { getMyProfile, updateMyProfile, changePassword as changePw, UpdateProfilePayload, ChangePasswordPayload, UserProfile } from '../services/profileService';
import { notificationService, AppNotification } from '../services/notificationService';

export type UserRole = 'STUDENT' | 'TUTOR' | 'ADMIN';
export type VerificationStatus = 'NOT_APPLICABLE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleInitial?: string;
  role: UserRole;
  profilePhotoUrl?: string;
  verificationStatus?: VerificationStatus;
  bio?: string;
  expertise?: string;
  subjects?: string;
  location?: string;
  rating?: number;
}

interface AppContextType {
  currentUser:            User | null;
  isLoading:              boolean;
  error:                  string | null;
  notifications:          AppNotification[];
  unreadCount:            number;
  login:                  (email: string, password: string) => Promise<boolean>;
  signup:                 (data: RegisterRequest) => Promise<boolean>;
  logout:                 () => Promise<void>;
  clearError:             () => void;
  updateProfile:          (payload: UpdateProfilePayload) => Promise<boolean>;
  changePassword:         (payload: ChangePasswordPayload) => Promise<boolean>;
  refreshProfile:         () => Promise<void>;
  fetchNotifications:     () => Promise<void>;
  markNotificationAsRead: (id: number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

function toUser(p: UserProfile): User {
  return {
    id: p.id, email: p.email, firstName: p.firstName, lastName: p.lastName,
    middleInitial: p.middleInitial, role: p.role, profilePhotoUrl: p.profilePhotoUrl,
    verificationStatus: p.verificationStatus, bio: p.bio, expertise: p.expertise,
    subjects: p.subjects, location: p.location, rating: p.rating,
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser,   setCurrentUser]   = useState<User | null>(null);
  const [isLoading,     setIsLoading]     = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const saveUser = useCallback((user: User) => {
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  }, []);

  // ── fetch notifications ────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const list = await notificationService.getAll();
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.isRead).length);
    } catch { /* silent */ }
  }, []);

  // ── poll unread count every 30s ────────────────────────────────────────
  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await notificationService.getUnreadCount();
        setUnreadCount(res.count);
      } catch { /* silent */ }
    }, 30_000);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  // ── session restore ────────────────────────────────────────────────────
  useEffect(() => {
    const token  = authService.getToken();
    const stored = localStorage.getItem('user');
    if (!token || !stored) return;
    try { setCurrentUser(JSON.parse(stored) as User); } catch { /* corrupt */ }
    getMyProfile()
      .then(p => { const u = toUser(p); saveUser(u); fetchNotifications(); startPolling(); })
      .catch(() => { setCurrentUser(null); authService.removeToken(); localStorage.removeItem('user'); });
  }, [saveUser, fetchNotifications, startPolling]);

  // ── login ──────────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true); setError(null);
    try {
      const res = await authService.login({ email, password });
      authService.setToken(res.data.token);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      const profile = await getMyProfile();
      saveUser(toUser(profile));
      fetchNotifications(); startPolling();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed'); return false;
    } finally { setIsLoading(false); }
  };

  // ── signup ─────────────────────────────────────────────────────────────
  const signup = async (data: RegisterRequest): Promise<boolean> => {
    setIsLoading(true); setError(null);
    try {
      const res = await authService.register(data);
      authService.setToken(res.data.token);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      const profile = await getMyProfile();
      saveUser(toUser(profile));
      fetchNotifications(); startPolling();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed'); return false;
    } finally { setIsLoading(false); }
  };

  // ── logout ─────────────────────────────────────────────────────────────
  const logout = async () => {
    try { await authService.logout(); } catch { /* best-effort */ }
    stopPolling();
    setCurrentUser(null); setNotifications([]); setUnreadCount(0);
    authService.removeToken();
    localStorage.removeItem('user'); localStorage.removeItem('refreshToken');
    setError(null);
  };

  const updateProfile = async (payload: UpdateProfilePayload): Promise<boolean> => {
    setIsLoading(true); setError(null);
    try { saveUser(toUser(await updateMyProfile(payload))); return true; }
    catch (err) { setError(err instanceof Error ? err.message : 'Update failed'); return false; }
    finally { setIsLoading(false); }
  };

  const changePassword = async (payload: ChangePasswordPayload): Promise<boolean> => {
    setIsLoading(true); setError(null);
    try { await changePw(payload); return true; }
    catch (err) { setError(err instanceof Error ? err.message : 'Password change failed'); return false; }
    finally { setIsLoading(false); }
  };

  const refreshProfile = async () => {
    try { saveUser(toUser(await getMyProfile())); } catch { /* silent */ }
  };

  const markNotificationAsRead = async (id: number) => {
    try {
      await notificationService.markOneRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const clearError = () => setError(null);

  return (
    <AppContext.Provider value={{
      currentUser, isLoading, error,
      notifications, unreadCount,
      login, signup, logout, clearError,
      updateProfile, changePassword, refreshProfile,
      fetchNotifications, markNotificationAsRead, markAllNotificationsRead,
    }}>
      {children}
    </AppContext.Provider>
  );
};