import { useState, useCallback, useEffect } from 'react';
import { UserProgress } from '../App';
import { supabase, isSupabaseConfigured, isDemoMode } from '../lib/supabase';

export type ModuleKey = 'early_primary' | 'upper_primary' | 'middle_school' | 'upper_secondary';

const STORAGE_PREFIX = 'qkitty_progress_';
const VERSION = '1.0';

export interface PersistedData extends UserProgress {
  version: string;
}

export function getStorageKey(moduleKey: ModuleKey): string {
  return `${STORAGE_PREFIX}${moduleKey}`;
}

export function getStudentUUID(): string {
  let uuid = localStorage.getItem('qkitty_student_uuid');
  if (!uuid) {
    uuid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('qkitty_student_uuid', uuid);
  }
  return uuid;
}

export function usePersistedProgress(moduleKey: ModuleKey): [UserProgress, (updater: UserProgress | ((prev: UserProgress) => UserProgress)) => void] {
  const [progress, setProgressState] = useState<UserProgress>(() => {
    const stored = localStorage.getItem(getStorageKey(moduleKey));
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PersistedData;
        return {
          points: parsed.points || 0,
          badges: parsed.badges || []
        };
      } catch (e) {
        console.error(`Failed to parse progress for ${moduleKey}`, e);
      }
    }
    return { points: 0, badges: [] };
  });

  useEffect(() => {
    // Log session start for this module
    logSessionEvent('message' as any, `Loaded module: ${moduleKey}`);
  }, [moduleKey]);

  const syncToSupabase = useCallback(async (nextProgress: UserProgress) => {
    if (!isSupabaseConfigured || isDemoMode) return;
    const classCode = localStorage.getItem('qkitty_class_code');
    if (!classCode) return;

    const studentUuid = getStudentUUID();
    
    try {
      const { error } = await supabase
        .from('student_progress')
        .upsert({
          student_uuid: studentUuid,
          class_code: classCode,
          module: moduleKey,
          xp: nextProgress.points,
          badges: nextProgress.badges,
          last_active: new Date().toISOString()
        }, {
          onConflict: 'student_uuid,class_code,module'
        });

      if (error) console.warn('Silent sync error:', error.message);
    } catch (e) {
      console.warn('Sync failed:', e);
    }
  }, [moduleKey]);

  const setProgress = useCallback((updater: UserProgress | ((prev: UserProgress) => UserProgress)) => {
    setProgressState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      
      const dataToStore: PersistedData = {
        ...next,
        version: VERSION
      };

      try {
        localStorage.setItem(getStorageKey(moduleKey), JSON.stringify(dataToStore));
        // Sync to Supabase silently
        syncToSupabase(next);
      } catch (e) {
        if (e instanceof Error && e.name === 'QuotaExceededError') {
          console.warn('LocalStorage quota exceeded. Progress might not be saved.');
        } else {
          console.error('Failed to save progress to localStorage', e);
        }
      }
      
      return next;
    });
  }, [moduleKey, syncToSupabase]);

  return [progress, setProgress];
}

export function clearProgress(moduleKey: ModuleKey) {
  localStorage.removeItem(getStorageKey(moduleKey));
}

export async function logSessionEvent(eventType: 'simulation' | 'quiz' | 'badge' | 'message', topic?: string) {
  if (!isSupabaseConfigured || isDemoMode) return;
  const classCode = localStorage.getItem('qkitty_class_code');
  if (!classCode) return;

  const studentUuid = getStudentUUID();
  
  try {
    await supabase.from('session_events').insert({
      student_uuid: studentUuid,
      class_code: classCode,
      event_type: eventType,
      topic
    });
  } catch (e) {
    // Fail silently
  }
}
