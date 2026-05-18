import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (url: string | undefined): url is string => {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isDemoMode = !isValidUrl(supabaseUrl) || !supabaseAnonKey || supabaseUrl === 'https://demo.supabase.co' || supabaseUrl === 'undefined' || supabaseUrl === 'null';
export const isSupabaseConfigured = isValidUrl(supabaseUrl) && !!supabaseAnonKey && !isDemoMode;

if (!isSupabaseConfigured && !isDemoMode) {
  console.warn('Supabase credentials missing or invalid. Student progress sync and teacher dashboard will not function. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in settings.');
}

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder'
);

/**
 * SCHEMA REFERENCE (SQL):
 * 
 * -- 1. Classrooms Table
 * CREATE TABLE classrooms (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   code VARCHAR(6) UNIQUE NOT NULL,
 *   teacher_id UUID REFERENCES auth.users(id) NOT NULL,
 *   name TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 2. Student Progress Table
 * CREATE TABLE student_progress (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   student_uuid VARCHAR NOT NULL,
 *   class_code VARCHAR(6) REFERENCES classrooms(code) ON DELETE CASCADE,
 *   module TEXT NOT NULL,
 *   xp INTEGER DEFAULT 0,
 *   badges JSONB DEFAULT '[]',
 *   last_active TIMESTAMPTZ DEFAULT NOW(),
 *   session_count INTEGER DEFAULT 1,
 *   UNIQUE(student_uuid, class_code, module)
 * );
 * 
 * -- 3. Session Events Table
 * CREATE TABLE session_events (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   student_uuid VARCHAR NOT NULL,
 *   class_code VARCHAR(6) REFERENCES classrooms(code) ON DELETE CASCADE,
 *   event_type TEXT NOT NULL, -- 'simulation' | 'quiz' | 'badge' | 'message'
 *   topic TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 */
