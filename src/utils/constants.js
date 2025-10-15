/**
 * Application constants
 */

export const APP_NAME = 'ExamPrep'
export const APP_DESCRIPTION = 'Master certification exams with professional practice'

// Supabase configuration (from exam-prep-test)
export const SUPABASE_URL = 'https://nknsajgstykclmneeecx.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbnNhamdzdHlrY2xtbmVlZWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDczOTIsImV4cCI6MjA3NTc4MzM5Mn0.0OM6VR8RFTS3hnxjPD7CzkBM9ks8SwmkZyD6BcbnUvc'

// Supabase table names
export const TABLES = {
  PROFILES: 'profiles',
  EXAM_TYPES: 'exam_types',
  QUESTION_SETS: 'question_sets',
  PACKAGES: 'packages',
  USER_PURCHASES: 'user_purchases',
  EXAM_ATTEMPTS: 'exam_attempts',
  USER_PROGRESS: 'user_progress',
  EXAM_RESULTS: 'exam_results'
}

// Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  EXAM_DETAIL: '/exam/:slug',
  EXAM_INTERFACE: '/exam/:slug/take',
  RESET_PASSWORD: '/reset-password'
}

// Cache expiry times (milliseconds)
export const CACHE_EXPIRY = {
  EXAMS: 24 * 60 * 60 * 1000, // 24 hours
  QUESTION_SETS: 24 * 60 * 60 * 1000, // 24 hours
  PROFILE: 60 * 60 * 1000, // 1 hour
  PROGRESS: 60 * 60 * 1000, // 1 hour
  PURCHASES: 30 * 60 * 1000 // 30 minutes
}

// Question types
export const QUESTION_TYPES = {
  SINGLE: 'single',
  MULTIPLE: 'multiple'
}

// Exam status
export const EXAM_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned'
}

// Sync priorities
export const SYNC_PRIORITY = {
  HIGH: 10,
  NORMAL: 5,
  LOW: 1
}

// Timer warnings (percentage of total time)
export const TIMER_WARNING = {
  WARNING: 0.25, // 25% remaining
  CRITICAL: 0.10 // 10% remaining
}

// Local storage keys prefix
export const STORAGE_PREFIX = 'examprep_'

// IndexedDB database name
export const IDB_NAME = 'ExamPrepDB'
export const IDB_VERSION = 1

// Sync intervals
export const SYNC_INTERVALS = {
  PROGRESS: 10000, // 10 seconds
  RESULTS: 5000, // 5 seconds
  RETRY: 5000 // 5 seconds
}

// Colors (for Tailwind)
export const COLORS = {
  PRIMARY: '#0A2540',
  ACCENT: '#00D4AA',
  SECONDARY: '#1A3B5C',
  SUCCESS: '#4ade80',
  WARNING: '#fbbf24',
  ERROR: '#ef4444'
}

export default {
  APP_NAME,
  APP_DESCRIPTION,
  TABLES,
  ROUTES,
  CACHE_EXPIRY,
  QUESTION_TYPES,
  EXAM_STATUS,
  SYNC_PRIORITY,
  TIMER_WARNING,
  STORAGE_PREFIX,
  IDB_NAME,
  IDB_VERSION,
  SYNC_INTERVALS,
  COLORS
}

