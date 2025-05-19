/**
 * Storage System for 8BitGE
 * Handles persistent data storage using localStorage with fallbacks
 */

export class StorageSystem {
  private prefix: string;
  private enabled: boolean;
  private memoryStorage: Map<string, string> = new Map();
  
  constructor(gameId: string, enabled: boolean = true) {
    this.prefix = `8bitge_${gameId}_`;
    this.enabled = enabled;
  }
  
  /**
   * Store an item in storage
   */
  setItem(key: string, value: string): void {
    if (!this.enabled) return;
    
    const prefixedKey = this.prefix + key;
    
    try {
      localStorage.setItem(prefixedKey, value);
    } catch (e) {
      // Fallback to memory storage if localStorage fails
      this.memoryStorage.set(prefixedKey, value);
      console.warn('[8BitGE] localStorage failed, using memory storage:', e);
    }
  }
  
  /**
   * Get an item from storage
   */
  getItem(key: string): string | null {
    if (!this.enabled) return null;
    
    const prefixedKey = this.prefix + key;
    
    try {
      const value = localStorage.getItem(prefixedKey);
      return value;
    } catch (e) {
      // Fallback to memory storage if localStorage fails
      return this.memoryStorage.get(prefixedKey) || null;
    }
  }
  
  /**
   * Remove an item from storage
   */
  removeItem(key: string): void {
    if (!this.enabled) return;
    
    const prefixedKey = this.prefix + key;
    
    try {
      localStorage.removeItem(prefixedKey);
    } catch (e) {
      // Fallback to memory storage if localStorage fails
      this.memoryStorage.delete(prefixedKey);
    }
  }
  
  /**
   * Clear all items from storage for this game
   */
  clear(): void {
    if (!this.enabled) return;
    
    try {
      // Only remove items with our prefix
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove identified keys
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn('[8BitGE] Error clearing localStorage:', e);
    }
    
    // Clear memory storage as well
    this.memoryStorage.clear();
  }
  
  /**
   * Set storage enabled/disabled
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  /**
   * Save an object as JSON
   */
  saveObject(key: string, object: any): void {
    try {
      const jsonString = JSON.stringify(object);
      this.setItem(key, jsonString);
    } catch (e) {
      console.error('[8BitGE] Failed to save object:', e);
    }
  }
  
  /**
   * Load an object from JSON
   */
  loadObject<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const jsonString = this.getItem(key);
      if (!jsonString) return defaultValue;
      
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('[8BitGE] Failed to load object:', e);
      return defaultValue;
    }
  }
  
  /**
   * Check if storage is available
   */
  isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      const result = localStorage.getItem(testKey) === 'test';
      localStorage.removeItem(testKey);
      return result;
    } catch (e) {
      return false;
    }
  }
}
