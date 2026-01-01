import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind class merge utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format XP number
export function formatXP(xp: number): string {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M`;
  }
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
}

// Calculate level from XP
export function calculateLevel(xp: number): number {
  const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8500, 13000, 20000];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) return i + 1;
  }
  return 1;
}

// Calculate XP progress for current level
export function calculateLevelProgress(xp: number): { current: number; required: number; percentage: number } {
  const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8500, 13000, 20000];
  const level = calculateLevel(xp);
  
  const currentThreshold = thresholds[level - 1] || 0;
  const nextThreshold = thresholds[level] || currentThreshold + 10000;
  
  const current = xp - currentThreshold;
  const required = nextThreshold - currentThreshold;
  const percentage = Math.min(100, (current / required) * 100);
  
  return { current, required, percentage };
}

// Format date
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const d = new Date(date);
  
  // Invalid date check
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format relative time
export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'hozirgina';
  if (diffMinutes < 60) return `${diffMinutes} daqiqa oldin`;
  if (diffHours < 24) return `${diffHours} soat oldin`;
  if (diffDays < 7) return `${diffDays} kun oldin`;
  
  return formatDate(date);
}

// Format duration
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Get difficulty color
export function getDifficultyColor(difficulty: 'EASY' | 'MEDIUM' | 'HARD'): string {
  switch (difficulty) {
    case 'EASY':
      return 'text-green-500 bg-green-500/10';
    case 'MEDIUM':
      return 'text-yellow-500 bg-yellow-500/10';
    case 'HARD':
      return 'text-red-500 bg-red-500/10';
  }
}

// Get difficulty label
export function getDifficultyLabel(difficulty: 'EASY' | 'MEDIUM' | 'HARD'): string {
  switch (difficulty) {
    case 'EASY':
      return 'Oson';
    case 'MEDIUM':
      return 'O\'rta';
    case 'HARD':
      return 'Qiyin';
  }
}

// Get score color
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Generate avatar placeholder
export function getAvatarPlaceholder(name: string): string {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return initials || '?';
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Local storage helpers
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};
