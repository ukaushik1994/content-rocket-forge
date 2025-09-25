import React from 'react';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { PWAUpdateNotification } from './PWAUpdateNotification';

interface PWAManagerProps {
  showInstallPrompt?: boolean;
  showUpdateNotification?: boolean;
  autoApplyUpdates?: boolean;
  installPromptPosition?: 'bottom' | 'top' | 'center';
  updateNotificationPosition?: 'bottom' | 'top';
}

/**
 * PWA Manager component that handles all PWA-related UI
 */
export const PWAManager: React.FC<PWAManagerProps> = ({
  showInstallPrompt = true,
  showUpdateNotification = true,
  autoApplyUpdates = false,
  installPromptPosition = 'bottom',
  updateNotificationPosition = 'top'
}) => {
  return (
    <>
      {showInstallPrompt && (
        <PWAInstallPrompt position={installPromptPosition} />
      )}
      {showUpdateNotification && (
        <PWAUpdateNotification 
          position={updateNotificationPosition}
          autoApplyUpdates={autoApplyUpdates}
        />
      )}
    </>
  );
};