import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Download, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pwaUpdateService, UpdateEventType, UpdateInfo } from '@/services/pwaUpdateService';
import { toast } from 'sonner';

interface PWAUpdateNotificationProps {
  className?: string;
  position?: 'bottom' | 'top';
  autoApplyUpdates?: boolean;
}

export const PWAUpdateNotification: React.FC<PWAUpdateNotificationProps> = ({
  className = '',
  position = 'top',
  autoApplyUpdates = false
}) => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [currentVersion, setCurrentVersion] = useState<string>('');

  useEffect(() => {
    // Get initial version
    pwaUpdateService.getVersion().then(version => {
      if (version) setCurrentVersion(version);
    });

    // Setup update event handler
    const unsubscribe = pwaUpdateService.onUpdate((type: UpdateEventType, info?: UpdateInfo) => {
      console.log('[PWAUpdate] Update event:', type, info);

      switch (type) {
        case 'update-available':
          if (info) {
            setUpdateInfo(info);
            setShowNotification(true);
            
            if (autoApplyUpdates) {
              // Auto apply update after showing notification briefly
              setTimeout(() => handleUpdate(), 3000);
            } else {
              toast.info('App update available', {
                description: 'A new version of the app is ready to install.',
                action: {
                  label: 'Update',
                  onClick: () => handleUpdate()
                }
              });
            }
          }
          break;

        case 'update-installed':
          setIsUpdating(false);
          setShowNotification(false);
          setUpdateProgress(100);
          
          toast.success('App updated successfully', {
            description: `Updated to version ${info?.newVersion || 'latest'}`
          });
          
          // Update current version
          if (info?.newVersion) {
            setCurrentVersion(info.newVersion);
          }
          break;

        case 'update-failed':
          setIsUpdating(false);
          setUpdateProgress(0);
          
          toast.error('Update failed', {
            description: 'Failed to update the app. Please try again.',
            action: {
              label: 'Retry',
              onClick: () => handleUpdate()
            }
          });
          break;
      }
    });

    return () => unsubscribe();
  }, [autoApplyUpdates]);

  const handleUpdate = async () => {
    if (!updateInfo?.canUpdate) return;

    setIsUpdating(true);
    setUpdateProgress(10);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUpdateProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await pwaUpdateService.applyUpdate();
      
      // Final progress update will be handled by the update-installed event
    } catch (error) {
      console.error('[PWAUpdate] Update error:', error);
      setIsUpdating(false);
      setUpdateProgress(0);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-update-dismissed', 'true');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Check if user dismissed in this session
  if (sessionStorage.getItem('pwa-update-dismissed')) {
    return null;
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'bottom-4 left-4 right-4';
      case 'top':
      default:
        return 'top-4 left-4 right-4';
    }
  };

  return (
    <AnimatePresence>
      {showNotification && updateInfo && (
        <motion.div
          initial={{ opacity: 0, y: position === 'bottom' ? 100 : -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'bottom' ? 100 : -100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`fixed ${getPositionClasses()} z-50 max-w-md mx-auto ${className}`}
        >
          <Card className="border border-border/50 bg-background/95 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <RefreshCw className={`h-5 w-5 text-primary ${isUpdating ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">App Update Available</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">
                        v{currentVersion}
                      </Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge>
                        Latest
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-8 w-8 p-0"
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-4">
                A new version is ready with bug fixes and improvements.
              </CardDescription>

              {isUpdating && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Updating...</span>
                    <span>{updateProgress}%</span>
                  </div>
                  <Progress value={updateProgress} className="h-2" />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleUpdate}
                  disabled={isUpdating || !updateInfo.canUpdate}
                  className="flex-1"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Update Now
                    </>
                  )}
                </Button>
                {!isUpdating && (
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    className="px-3"
                    title="Refresh to apply"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="mt-3 text-xs text-muted-foreground text-center">
                Update includes performance improvements and new features
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Hook for PWA update management
 */
export const usePWAUpdate = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>(pwaUpdateService.getUpdateInfo());
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const unsubscribe = pwaUpdateService.onUpdate((type, info) => {
      if (info) {
        setUpdateInfo(info);
      }
      setIsUpdating(type === 'update-available' && info?.canUpdate === true);
    });

    return () => unsubscribe();
  }, []);

  const checkForUpdates = async () => {
    await pwaUpdateService.checkForUpdates();
  };

  const applyUpdate = async () => {
    if (updateInfo.canUpdate) {
      await pwaUpdateService.applyUpdate();
    }
  };

  const getVersion = async () => {
    return await pwaUpdateService.getVersion();
  };

  const clearCaches = async () => {
    try {
      await pwaUpdateService.clearCaches();
      toast.success('Caches cleared successfully');
    } catch (error) {
      toast.error('Failed to clear caches');
    }
  };

  const getStorageInfo = async () => {
    return await pwaUpdateService.getStorageEstimate();
  };

  return {
    updateInfo,
    isUpdating,
    checkForUpdates,
    applyUpdate,
    getVersion,
    clearCaches,
    getStorageInfo
  };
};