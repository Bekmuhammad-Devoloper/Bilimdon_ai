import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const authApi = {
  register: (data: { email: string; username: string; password: string; fullName: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  telegramAuth: (initData: string) =>
    api.post('/telegram/webapp/auth', { initData }),
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/change-password', data),
};

// ==================== USERS ====================
export const usersApi = {
  getProfile: () =>
    api.get('/users/profile'),
  
  updateProfile: (data: { fullName?: string; bio?: string }) =>
    api.patch('/users/profile', data),
  
  getCategoryStats: () =>
    api.get('/users/stats/categories'),
  
  getTestHistory: (page = 1, limit = 10) =>
    api.get(`/users/history/tests?page=${page}&limit=${limit}`),
};

// ==================== CATEGORIES ====================
export const categoriesApi = {
  getAll: () =>
    api.get('/categories'),
  
  getBySlug: (slug: string) =>
    api.get(`/categories/${slug}`),
  
  getStats: (id: string) =>
    api.get(`/categories/${id}/stats`),
};

// ==================== TESTS ====================
export const testsApi = {
  start: (data: { categoryId?: string; questionsCount?: number }) =>
    api.post('/tests/start', data),
  
  submit: (testId: string, answers: Array<{ questionId: string; selectedAnswer: number }>) =>
    api.post(`/tests/${testId}/submit`, { answers }),
  
  getResult: (testId: string) =>
    api.get(`/tests/${testId}/result`),
  
  getHistory: (page = 1, limit = 10) =>
    api.get(`/tests/history?page=${page}&limit=${limit}`),
};

// ==================== LEADERBOARD ====================
export const leaderboardApi = {
  getGlobal: (page = 1, limit = 100) =>
    api.get(`/leaderboard/global?page=${page}&limit=${limit}`),
  
  getCategory: (categoryId: string, page = 1, limit = 50) =>
    api.get(`/leaderboard/category/${categoryId}?page=${page}&limit=${limit}`),
  
  getWeekly: (page = 1, limit = 50) =>
    api.get(`/leaderboard/weekly?page=${page}&limit=${limit}`),
  
  getMonthly: (page = 1, limit = 50) =>
    api.get(`/leaderboard/monthly?page=${page}&limit=${limit}`),
  
  getMyRank: () =>
    api.get('/leaderboard/my-rank'),
};

// ==================== AI ====================
export const aiApi = {
  chat: (message: string, categoryId?: string) =>
    api.post('/ai/chat', { message, categoryId }),
  
  getHistory: (page = 1, limit = 50) =>
    api.get(`/ai/history?page=${page}&limit=${limit}`),
  
  getUsage: () =>
    api.get('/ai/usage'),
  
  clearHistory: () =>
    api.delete('/ai/history'),
};

// ==================== ACHIEVEMENTS ====================
export const achievementsApi = {
  getAll: () =>
    api.get('/achievements'),
  
  getMy: () =>
    api.get('/achievements/my'),
};

// ==================== NOTIFICATIONS ====================
export const notificationsApi = {
  getAll: (page = 1, limit = 20) =>
    api.get(`/notifications?page=${page}&limit=${limit}`),
  
  getUnreadCount: () =>
    api.get('/notifications/unread-count'),
  
  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    api.patch('/notifications/read-all'),
  
  delete: (id: string) =>
    api.delete(`/notifications/${id}`),
};

// ==================== UPLOAD ====================
export const uploadApi = {
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
