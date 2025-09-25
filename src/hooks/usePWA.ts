import { useState, useEffect } from 'react';
import { indexedDB } from '@/utils/indexedDB';
import { backgroundSyncService } from '@/services/backgroundSyncService';

export interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  syncPending: number;
  storageUsed: number;
}

export interface PWAControls {
  syncNow: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
}

/**
 * Comprehensive PWA management hook
 */
export const usePWA = () => {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: navigator.onLine,
    syncPending: 0,
    storageUsed: 0
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

        // Get storage info
        const offlineStorage = await indexedDB.getStorageInfo();

        if (mounted) {
          setStatus({
            isInstalled,
            isOnline: navigator.onLine,
            syncPending: syncStatus.pendingCount,
            storageUsed: offlineStorage?.offlineDataCount || 0
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
      clearInterval(statusInterval);
    };
  }, []);

  const controls: PWAControls = {
    syncNow: async () => {
      await backgroundSyncService.forcSync();
      // Update sync status
      const syncStatus = await backgroundSyncService.getSyncStatus();
      setStatus(prev => ({ ...prev, syncPending: syncStatus.pendingCount }));
    },

    clearOfflineData: async () => {
      await indexedDB.clearAll();
      // Update storage info
      const offlineStorage = await indexedDB.getStorageInfo();
      setStatus(prev => ({ 
        ...prev, 
        storageUsed: offlineStorage?.offlineDataCount || 0
      }));
    }
  };

  return {
    status,
    controls,
    isLoading
  };
};