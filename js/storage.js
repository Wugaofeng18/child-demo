/**
 * Local Storage Management Module
 * Handles data persistence using browser's localStorage
 */

class StorageManager {
  constructor() {
    this.storageKeys = {
      HISTORY: 'literacy_generation_history',
      PREFERENCES: 'literacy_user_preferences',
      API_KEY: 'literacy_api_key',
      CACHE: 'literacy_image_cache'
    };

    this.defaultPreferences = {
      language: 'zh-CN',
      autoSave: true,
      maxHistory: 50,
      theme: 'auto',
      soundEnabled: true,
      autoDownload: false
    };

    this.maxCacheSize = 50 * 1024 * 1024; // 50MB cache limit
  }

  /**
   * Get localStorage with error handling
   * @returns {Storage|null} localStorage object or null if unavailable
   */
  getStorage() {
    try {
      return window.localStorage;
    } catch (error) {
      console.error('localStorage not available:', error);
      return null;
    }
  }

  /**
   * Check if localStorage is available
   * @returns {boolean} True if localStorage is available
   */
  isAvailable() {
    const storage = this.getStorage();
    if (!storage) return false;

    try {
      const testKey = '__test_storage__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Save data to localStorage with error handling
   * @param {string} key - Storage key
   * @param {*} data - Data to save
   * @returns {boolean} True if successful
   */
  setItem(key, data) {
    const storage = this.getStorage();
    if (!storage) return false;

    try {
      const serializedData = JSON.stringify(data);
      storage.setItem(key, serializedData);
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      this.handleStorageError(error);
      return false;
    }
  }

  /**
   * Get data from localStorage with error handling
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} Retrieved data or default value
   */
  getItem(key, defaultValue = null) {
    const storage = this.getStorage();
    if (!storage) return defaultValue;

    try {
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key to remove
   * @returns {boolean} True if successful
   */
  removeItem(key) {
    const storage = this.getStorage();
    if (!storage) return false;

    try {
      storage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }

  /**
   * Clear all app data from localStorage
   * @returns {boolean} True if successful
   */
  clearAll() {
    const storage = this.getStorage();
    if (!storage) return false;

    try {
      Object.values(this.storageKeys).forEach(key => {
        storage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  /**
   * Handle storage errors (quota exceeded, etc.)
   * @param {Error} error - Storage error
   */
  handleStorageError(error) {
    if (error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded, cleaning up old data...');
      this.cleanupOldData();
      Utils.showToast('存储空间不足，已清理部分旧数据', 'warning');
    }
  }

  /**
   * Clean up old data to free space
   */
  cleanupOldData() {
    const storage = this.getStorage();
    if (!storage) return;

    try {
      // Clean old history items
      const history = this.getHistory();
      if (history.length > 20) {
        const recentHistory = history.slice(-20);
        this.saveHistory(recentHistory);
      }

      // Clean image cache
      this.cleanImageCache();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  /**
   * Save generation history
   * @param {Array} history - Array of history items
   * @returns {boolean} True if successful
   */
  saveHistory(history) {
    if (!Array.isArray(history)) {
      console.error('History must be an array');
      return false;
    }

    const preferences = this.getPreferences();
    const maxHistory = preferences.maxHistory || this.defaultPreferences.maxHistory;

    // Limit history size
    const limitedHistory = history.slice(-maxHistory);

    return this.setItem(this.storageKeys.HISTORY, limitedHistory);
  }

  /**
   * Get generation history
   * @returns {Array} Array of history items
   */
  getHistory() {
    return this.getItem(this.storageKeys.HISTORY, []);
  }

  /**
   * Add item to history
   * @param {Object} item - History item to add
   * @returns {boolean} True if successful
   */
  addToHistory(item) {
    if (!item || typeof item !== 'object') {
      console.error('Invalid history item');
      return false;
    }

    const history = this.getHistory();
    const newItem = {
      id: Utils.generateUUID(),
      timestamp: Date.now(),
      ...item
    };

    history.push(newItem);

    // Check auto-save preference
    const preferences = this.getPreferences();
    if (preferences.autoSave) {
      return this.saveHistory(history);
    }

    return true;
  }

  /**
   * Remove item from history
   * @param {string} itemId - ID of item to remove
   * @returns {boolean} True if successful
   */
  removeFromHistory(itemId) {
    const history = this.getHistory();
    const filteredHistory = history.filter(item => item.id !== itemId);

    if (filteredHistory.length === history.length) {
      console.warn('Item not found in history:', itemId);
      return false;
    }

    return this.saveHistory(filteredHistory);
  }

  /**
   * Clear all history
   * @returns {boolean} True if successful
   */
  clearHistory() {
    return this.setItem(this.storageKeys.HISTORY, []);
  }

  /**
   * Save user preferences
   * @param {Object} preferences - Preferences object
   * @returns {boolean} True if successful
   */
  savePreferences(preferences) {
    const mergedPreferences = {
      ...this.defaultPreferences,
      ...preferences
    };

    return this.setItem(this.storageKeys.PREFERENCES, mergedPreferences);
  }

  /**
   * Get user preferences
   * @returns {Object} Preferences object
   */
  getPreferences() {
    return this.getItem(this.storageKeys.PREFERENCES, this.defaultPreferences);
  }

  /**
   * Update specific preference
   * @param {string} key - Preference key
   * @param {*} value - Preference value
   * @returns {boolean} True if successful
   */
  updatePreference(key, value) {
    const preferences = this.getPreferences();
    preferences[key] = value;
    return this.savePreferences(preferences);
  }

  /**
   * Save API key (encrypted)
   * @param {string} apiKey - API key to save
   * @returns {boolean} True if successful
   */
  saveApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      console.error('Invalid API key');
      return false;
    }

    // Simple obfuscation (not encryption for demo)
    const obfuscatedKey = btoa(apiKey);
    return this.setItem(this.storageKeys.API_KEY, obfuscatedKey);
  }

  /**
   * Get API key (decrypted)
   * @returns {string|null} API key or null if not found
   */
  getApiKey() {
    const obfuscatedKey = this.getItem(this.storageKeys.API_KEY);
    if (!obfuscatedKey) return null;

    try {
      return atob(obfuscatedKey);
    } catch (error) {
      console.error('Error decoding API key:', error);
      return null;
    }
  }

  /**
   * Remove API key
   * @returns {boolean} True if successful
   */
  removeApiKey() {
    return this.removeItem(this.storageKeys.API_KEY);
  }

  /**
   * Cache image data
   * @param {string} url - Image URL
   * @param {string} data - Base64 image data
   * @returns {boolean} True if successful
   */
  cacheImage(url, data) {
    const cache = this.getItem(this.storageKeys.CACHE, {});

    // Check cache size limit
    if (this.getCacheSize() > this.maxCacheSize) {
      this.cleanImageCache();
    }

    cache[url] = {
      data: data,
      timestamp: Date.now()
    };

    return this.setItem(this.storageKeys.CACHE, cache);
  }

  /**
   * Get cached image data
   * @param {string} url - Image URL
   * @returns {string|null} Base64 image data or null if not cached
   */
  getCachedImage(url) {
    const cache = this.getItem(this.storageKeys.CACHE, {});
    const cachedItem = cache[url];

    if (!cachedItem) return null;

    // Check if cache item is expired (30 days)
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    if (Date.now() - cachedItem.timestamp > maxAge) {
      delete cache[url];
      this.setItem(this.storageKeys.CACHE, cache);
      return null;
    }

    return cachedItem.data;
  }

  /**
   * Get current cache size in bytes
   * @returns {number} Cache size in bytes
   */
  getCacheSize() {
    const cache = this.getItem(this.storageKeys.CACHE, {});
    const cacheString = JSON.stringify(cache);
    return new Blob([cacheString]).size;
  }

  /**
   * Clean old image cache entries
   */
  cleanImageCache() {
    const cache = this.getItem(this.storageKeys.CACHE, {});
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    Object.keys(cache).forEach(url => {
      if (now - cache[url].timestamp > maxAge) {
        delete cache[url];
      }
    });

    this.setItem(this.storageKeys.CACHE, cache);
  }

  /**
   * Clear all image cache
   */
  clearImageCache() {
    return this.setItem(this.storageKeys.CACHE, {});
  }

  /**
   * Export all data as JSON
   * @returns {Object} All app data
   */
  exportAllData() {
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      history: this.getHistory(),
      preferences: this.getPreferences(),
      // Note: API key is not exported for security reasons
    };
  }

  /**
   * Import data from JSON
   * @param {Object} data - Data to import
   * @returns {Object} Import result
   */
  importData(data) {
    const result = {
      success: false,
      imported: {
        history: 0,
        preferences: false
      },
      errors: []
    };

    try {
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format');
      }

      // Import history
      if (data.history && Array.isArray(data.history)) {
        const existingHistory = this.getHistory();
        const combinedHistory = [...existingHistory, ...data.history];

        // Remove duplicates based on ID
        const uniqueHistory = combinedHistory.filter((item, index, arr) =>
          arr.findIndex(i => i.id === item.id) === index
        );

        if (this.saveHistory(uniqueHistory)) {
          result.imported.history = data.history.length;
        } else {
          result.errors.push('Failed to import history');
        }
      }

      // Import preferences
      if (data.preferences && typeof data.preferences === 'object') {
        if (this.savePreferences(data.preferences)) {
          result.imported.preferences = true;
        } else {
          result.errors.push('Failed to import preferences');
        }
      }

      result.success = result.errors.length === 0;

    } catch (error) {
      result.errors.push(`Import error: ${error.message}`);
    }

    return result;
  }

  /**
   * Get storage usage statistics
   * @returns {Object} Storage usage info
   */
  getStorageInfo() {
    const storage = this.getStorage();
    if (!storage) return null;

    let totalSize = 0;
    let usedSize = 0;
    const items = {};

    // Calculate sizes
    Object.values(this.storageKeys).forEach(key => {
      try {
        const item = storage.getItem(key);
        if (item) {
          const size = new Blob([item]).size;
          items[key] = size;
          usedSize += size;
        }
      } catch (error) {
        items[key] = 0;
      }
    });

    totalSize = usedSize;

    return {
      total: totalSize,
      used: usedSize,
      available: 'Unknown', // Browser doesn't expose this info
      items: items,
      formatted: {
        total: Utils.formatFileSize(totalSize),
        used: Utils.formatFileSize(usedSize)
      }
    };
  }

  /**
   * Initialize storage with default values
   */
  initialize() {
    if (!this.isAvailable()) {
      console.warn('localStorage not available, some features may be limited');
      return false;
    }

    // Initialize preferences if not exists
    const preferences = this.getItem(this.storageKeys.PREFERENCES);
    if (!preferences) {
      this.savePreferences(this.defaultPreferences);
    }

    console.log('Storage manager initialized successfully');
    return true;
  }
}

// Create singleton instance
window.storageManager = new StorageManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}