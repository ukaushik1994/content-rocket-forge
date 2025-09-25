import React from 'react';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface PWAManagerProps {
  showInstallPrompt?: boolean;
  installPromptPosition?: 'bottom' | 'top' | 'center';
}

/**
 * PWA Manager component that handles PWA installation
 */
export const PWAManager: React.FC<PWAManagerProps> = ({
  showInstallPrompt = true,
  installPromptPosition = 'bottom'
}) => {
  return (
    <>
      {showInstallPrompt && (
        <PWAInstallPrompt position={installPromptPosition} />
      )}
    </>
  );
};