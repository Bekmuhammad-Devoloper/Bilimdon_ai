'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { authApi, categoriesApi, notificationsApi } from '@/lib/api';
import { isTelegramWebApp, getTelegramInitData, telegramReady, telegramExpand } from '@/lib/telegram';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

// Auth hook
export function useAuth() {
  const { user, token, isAuthenticated, isLoading, login, logout, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      // Check if in Telegram Mini App
      if (isTelegramWebApp()) {
        telegramReady();
        telegramExpand();
        
        const initData = getTelegramInitData();
        if (initData && !isAuthenticated) {
          try {
            const { data } = await authApi.telegramAuth(initData);
            login(data.user, data.token);
          } catch (error) {
            console.error('Telegram auth error:', error);
          }
        }
      } else if (token && !user) {
        // Verify existing token
        try {
          const { data } = await authApi.getProfile();
          login(data, token);
        } catch (error) {
          logout();
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    router.push('/auth/login');
  }, [logout, router]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    logout: handleLogout,
  };
}

// Categories hook
export function useCategories() {
  const { categories, setCategories } = useAppStore();
  const [loading, setLoading] = useState(!categories.length);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (categories.length > 0) return;
      
      try {
        const { data } = await categoriesApi.getAll();
        setCategories(data);
      } catch (err: any) {
        setError(err.message || 'Kategoriyalarni yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [categories.length, setCategories]);

  return { categories, loading, error };
}

// Notifications hook with WebSocket
export function useNotifications() {
  const { token } = useAuthStore();
  const { 
    notifications, 
    unreadCount, 
    setNotifications, 
    setUnreadCount, 
    addNotification,
    markAsRead,
    setSocketConnected,
  } = useAppStore();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const [notifRes, countRes] = await Promise.all([
          notificationsApi.getAll(),
          notificationsApi.getUnreadCount(),
        ]);
        setNotifications(notifRes.data.notifications || notifRes.data);
        setUnreadCount(countRes.data.count || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Setup WebSocket
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socketInstance = io(`${API_URL}/notifications`, {
      auth: { token },
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      setSocketConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setSocketConnected(false);
    });

    socketInstance.on('notification', (notification) => {
      addNotification(notification);
      toast(notification.title, {
        icon: '🔔',
        duration: 5000,
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [markAsRead]);

  return {
    notifications,
    unreadCount,
    markAsRead: handleMarkAsRead,
  };
}

// Theme hook
export function useTheme() {
  const { theme, setTheme } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme, mounted]);

  return { theme, setTheme, mounted };
}

// Media query hook
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Local storage hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}
