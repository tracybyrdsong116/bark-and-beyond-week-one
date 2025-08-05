import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';

class OfflineStorageService {
  constructor() {
    this.isOnline = true;
    this.syncQueue = [];
    this.syncInProgress = false;
    this.listeners = [];
    
    // Initialize network monitoring
    this.initializeNetworkMonitoring();
  }

  async initialize() {
    try {
      // Load sync queue from storage
      await this.loadSyncQueue();
      
      // Check initial network status
      const netInfo = await NetInfo.fetch();
      this.isOnline = netInfo.isConnected;
      
      // Start sync if online
      if (this.isOnline) {
        await this.processSyncQueue();
      }
      
      console.log('OfflineStorageService initialized successfully');
    } catch (error) {
      console.error('OfflineStorageService initialization failed:', error);
      throw error;
    }
  }

  initializeNetworkMonitoring() {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected;
      
      console.log('Network status changed:', {
        isConnected: state.isConnected,
        type: state.type,
        isInternetReachable: state.isInternetReachable
      });
      
      // If we just came online, process sync queue
      if (!wasOnline && this.isOnline) {
        this.processSyncQueue();
      }
      
      // Notify listeners
      this.notifyListeners({
        isOnline: this.isOnline,
        connectionType: state.type
      });
    });
  }

  // Network status listeners
  addNetworkListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notifyListeners(networkInfo) {
    this.listeners.forEach(listener => {
      try {
        listener(networkInfo);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
  }

  // Core storage methods
  async storeData(key, data, options = {}) {
    try {
      const storageData = {
        data,
        timestamp: new Date().toISOString(),
        version: options.version || 1,
        needsSync: options.needsSync || false
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(storageData));
      
      // Add to sync queue if needed
      if (options.needsSync) {
        await this.addToSyncQueue({
          action: 'update',
          key,
          data,
          timestamp: storageData.timestamp
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error storing data:', error);
      throw error;
    }
  }

  async getData(key, defaultValue = null) {
    try {
      const storedData = await AsyncStorage.getItem(key);
      
      if (storedData === null) {
        return defaultValue;
      }
      
      const parsedData = JSON.parse(storedData);
      return parsedData.data;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return defaultValue;
    }
  }

  async removeData(key, options = {}) {
    try {
      await AsyncStorage.removeItem(key);
      
      // Add to sync queue if needed
      if (options.needsSync) {
        await this.addToSyncQueue({
          action: 'delete',
          key,
          timestamp: new Date().toISOString()
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error removing data:', error);
      throw error;
    }
  }

  // Pet profile management
  async storePetProfile(petProfile) {
    const key = `pet_profile_${petProfile.id}`;
    return await this.storeData(key, petProfile, { needsSync: true });
  }

  async getPetProfile(petId) {
    const key = `pet_profile_${petId}`;
    return await this.getData(key);
  }

  async getAllPetProfiles() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const petProfileKeys = keys.filter(key => key.startsWith('pet_profile_'));
      
      const profiles = [];
      for (const key of petProfileKeys) {
        const profile = await this.getData(key);
        if (profile) {
          profiles.push(profile);
        }
      }
      
      return profiles;
    } catch (error) {
      console.error('Error getting all pet profiles:', error);
      return [];
    }
  }

  // Health data management
  async storeHealthData(petId, healthData) {
    const key = `health_data_${petId}_${Date.now()}`;
    return await this.storeData(key, healthData, { needsSync: true });
  }

  async getHealthData(petId, limit = 50) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const healthDataKeys = keys
        .filter(key => key.startsWith(`health_data_${petId}_`))
        .sort((a, b) => {
          const timestampA = parseInt(a.split('_').pop());
          const timestampB = parseInt(b.split('_').pop());
          return timestampB - timestampA; // Most recent first
        })
        .slice(0, limit);
      
      const healthData = [];
      for (const key of healthDataKeys) {
        const data = await this.getData(key);
        if (data) {
          healthData.push(data);
        }
      }
      
      return healthData;
    } catch (error) {
      console.error('Error getting health data:', error);
      return [];
    }
  }

  // Activity data management
  async storeActivityData(petId, activityData) {
    const key = `activity_data_${petId}_${Date.now()}`;
    return await this.storeData(key, activityData, { needsSync: true });
  }

  async getActivityData(petId, limit = 100) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const activityDataKeys = keys
        .filter(key => key.startsWith(`activity_data_${petId}_`))
        .sort((a, b) => {
          const timestampA = parseInt(a.split('_').pop());
          const timestampB = parseInt(b.split('_').pop());
          return timestampB - timestampA;
        })
        .slice(0, limit);
      
      const activityData = [];
      for (const key of activityDataKeys) {
        const data = await this.getData(key);
        if (data) {
          activityData.push(data);
        }
      }
      
      return activityData;
    } catch (error) {
      console.error('Error getting activity data:', error);
      return [];
    }
  }

  // Product cache management
  async cacheProducts(products) {
    return await this.storeData('cached_products', {
      products,
      lastUpdated: new Date().toISOString()
    });
  }

  async getCachedProducts() {
    const cachedData = await this.getData('cached_products');
    if (!cachedData) return null;
    
    // Check if cache is still valid (24 hours)
    const lastUpdated = new Date(cachedData.lastUpdated);
    const now = new Date();
    const hoursDiff = (now - lastUpdated) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      return null; // Cache expired
    }
    
    return cachedData.products;
  }

  // Sync queue management
  async addToSyncQueue(syncItem) {
    try {
      this.syncQueue.push({
        ...syncItem,
        id: Date.now() + Math.random(),
        retryCount: 0
      });
      
      await this.saveSyncQueue();
      
      // Process immediately if online
      if (this.isOnline && !this.syncInProgress) {
        await this.processSyncQueue();
      }
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }

  async loadSyncQueue() {
    try {
      const queueData = await AsyncStorage.getItem('sync_queue');
      this.syncQueue = queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Error loading sync queue:', error);
      this.syncQueue = [];
    }
  }

  async saveSyncQueue() {
    try {
      await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  async processSyncQueue() {
    if (!this.isOnline || this.syncInProgress || this.syncQueue.length === 0) {
      return;
    }
    
    this.syncInProgress = true;
    
    try {
      console.log(`Processing ${this.syncQueue.length} items in sync queue`);
      
      const processedItems = [];
      
      for (const item of this.syncQueue) {
        try {
          const success = await this.syncItem(item);
          
          if (success) {
            processedItems.push(item);
          } else {
            // Increment retry count
            item.retryCount = (item.retryCount || 0) + 1;
            
            // Remove item if max retries exceeded
            if (item.retryCount >= 3) {
              console.warn('Max retries exceeded for sync item:', item);
              processedItems.push(item);
            }
          }
        } catch (error) {
          console.error('Error syncing item:', error);
          item.retryCount = (item.retryCount || 0) + 1;
          
          if (item.retryCount >= 3) {
            processedItems.push(item);
          }
        }
      }
      
      // Remove processed items from queue
      this.syncQueue = this.syncQueue.filter(item => !processedItems.includes(item));
      await this.saveSyncQueue();
      
      console.log(`Sync completed. ${processedItems.length} items processed, ${this.syncQueue.length} items remaining`);
    } catch (error) {
      console.error('Error processing sync queue:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  async syncItem(item) {
    // This would integrate with your backend API
    // For now, we'll simulate the sync process
    
    try {
      console.log('Syncing item:', item.action, item.key);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would:
      // 1. Make API calls to sync data with backend
      // 2. Handle conflicts and merge strategies
      // 3. Update local data with server response
      
      return true; // Success
    } catch (error) {
      console.error('Sync item failed:', error);
      return false;
    }
  }

  // Utility methods
  async clearAllData() {
    try {
      await AsyncStorage.clear();
      this.syncQueue = [];
      console.log('All offline data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  async getStorageInfo() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const syncQueueSize = this.syncQueue.length;
      
      return {
        totalKeys: keys.length,
        syncQueueSize,
        isOnline: this.isOnline,
        syncInProgress: this.syncInProgress
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }

  // Check if data needs refresh
  async shouldRefreshData(key, maxAgeHours = 24) {
    try {
      const storedData = await AsyncStorage.getItem(key);
      
      if (!storedData) {
        return true; // No data, needs refresh
      }
      
      const parsedData = JSON.parse(storedData);
      const lastUpdated = new Date(parsedData.timestamp);
      const now = new Date();
      const hoursDiff = (now - lastUpdated) / (1000 * 60 * 60);
      
      return hoursDiff > maxAgeHours;
    } catch (error) {
      console.error('Error checking data freshness:', error);
      return true; // Error, assume needs refresh
    }
  }
}

export default new OfflineStorageService();