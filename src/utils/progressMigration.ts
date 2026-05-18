import { getStorageKey, ModuleKey, PersistedData } from '../hooks/usePersistedProgress';

const CURRENT_VERSION = '1.0';

export function migrateProgress() {
  const modules: ModuleKey[] = ['early_primary', 'upper_primary', 'middle_school', 'upper_secondary'];
  
  modules.forEach(key => {
    const storageKey = getStorageKey(key);
    const rawData = localStorage.getItem(storageKey);
    
    if (!rawData) return;
    
    try {
      let data = JSON.parse(rawData);
      
      // If version is missing or old, perform migrations here
      if (!data.version) {
        console.log(`Migrating ${key} to version ${CURRENT_VERSION}`);
        data.version = CURRENT_VERSION;
        // In the future, add specific logic for structure changes
        localStorage.setItem(storageKey, JSON.stringify(data));
      }
      
    } catch (e) {
      console.error(`Migration failed for ${key}`, e);
    }
  });
}
