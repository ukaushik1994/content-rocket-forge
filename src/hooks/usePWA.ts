import { useState, useEffect } from 'react';
import { indexedDB } from '@/utils/indexedDB';
import { backgroundSyncService } from '@/services/backgroundSyncService';
import { pwaUpdateService } from '@/services/pwaUpdateService';

export interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  syncPending: number;
  storageUsed: number;
  cacheSize: number;
}

export interface PWAControls {
  checkForUpdates: () => Promise<void>;
  applyUpdate: () => Promise<void>;
  syncNow: () => Promise<void>;
  clearCache: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
  requestPersistentStorage: () => Promise<boolean>;
}

/**
 * Comprehensive PWA management hook
 */
export const usePWA = () => {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: navigator.onLine,
    updateAvailable: false,
    syncPending: 0,
    storageUsed: 0,
    cacheSize: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializePWA = async () => {
      try {
        await indexedDB.init();
        await updateStatus();
      } catch (error) {
        console.error('[PWA] Initialization error:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    const updateStatus = async () => {
      try {
        // Check installation status
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isInstalled = (window.navigator as any).standalone === true || isStandalone;

        // Get sync status
        const syncStatus = await backgroundSyncService.getSyncStatus();

        // Get update info
        const updateInfo = pwaUpdateService.getUpdateInfo();

        // Get storage info
        const storageEstimate = await pwaUpdateService.getStorageEstimate();
        const offlineStorage = await indexedDB.getStorageInfo();

        if (mounted) {
          setStatus({
            isInstalled,
            isOnline: navigator.onLine,
            updateAvailable: updateInfo.isUpdateAvailable,
            syncPending: syncStatus.pendingCount,
            storageUsed: storageEstimate?.usage || 0,
            cacheSize: storageEstimate?.quota || 0
          });
        }
      } catch (error) {
        console.error('[PWA] Status update error:', error);
      }
    };

    // Setup event listeners
    const handleOnline = () => {
      if (mounted) {
        setStatus(prev => ({ ...prev, isOnline: true }));
        updateStatus();
      }
    };

    const handleOffline = () => {
      if (mounted) {
        setStatus(prev => ({ ...prev, isOnline: false }));
      }
    };

    const handleAppInstalled = () => {
      if (mounted) {
        setStatus(prev => ({ ...prev, isInstalled: true }));
      }
    };

    // Setup PWA update listener
    const unsubscribeUpdate = pwaUpdateService.onUpdate((type, info) => {
      if (mounted && type === 'update-available') {
        setStatus(prev => ({ 
          ...prev, 
          updateAvailable: info?.isUpdateAvailable || false 
        }));
      }
    });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('appinstalled', handleAppInstalled);

    initializePWA();

    // Update status periodically
    const statusInterval = setInterval(updateStatus, 30000);

    return () => {
      mounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('appinstalled', handleAppInstalled);
      unsubscribeUpdate();
      clearInterval(statusInterval);
    };
  }, []);

  const controls: PWAControls = {
    checkForUpdates: async () => {
      await pwaUpdateService.checkForUpdates();
    },

    applyUpdate: async () => {
      await pwaUpdateService.applyUpdate();
    },

    syncNow: async () => {
      await backgroundSyncService.forcSync();
      // Update sync status
      const syncStatus = await backgroundSyncService.getSyncStatus();
      setStatus(prev => ({ ...prev, syncPending: syncStatus.pendingCount }));
    },

    clearCache: async () => {
      await pwaUpdateService.clearCaches();
      // Update storage info
      const storageEstimate = await pwaUpdateService.getStorageEstimate();
      setStatus(prev => ({ 
        ...prev, 
        storageUsed: storageEstimate?.usage || 0,
        cacheSize: storageEstimate?.quota || 0
      }));
    },

    clearOfflineData: async () => {
      await indexedDB.clearAll();
      // Update storage info
      const storageEstimate = await pwaUpdateService.getStorageEstimate();
      setStatus(prev => ({ 
        ...prev, 
        storageUsed: storageEstimate?.usage || 0
      }));
    },

    requestPersistentStorage: async () => {
      return await pwaUpdateService.requestPersistentStorage();
    }
  };

  return {
    status,
    controls,
    isLoading
  };
};