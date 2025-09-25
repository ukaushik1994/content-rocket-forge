import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallPromptProps {
  className?: string;
  autoShow?: boolean;
  showDismissButton?: boolean;
  position?: 'bottom' | 'top' | 'center';
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  className = '',
  autoShow = true,
  showDismissButton = true,
  position = 'bottom'
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installChoice, setInstallChoice] = useState<string | null>(null);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInstalled = (window.navigator as any).standalone === true || isStandalone;
      setIsInstalled(isInstalled);
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      if (autoShow && !isInstalled) {
        // Show prompt after a short delay
        setTimeout(() => setShowPrompt(true), 2000);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('[PWAInstall] App was installed');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [autoShow, isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      console.log('[PWAInstall] User choice:', choiceResult.outcome);
      setInstallChoice(choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('[PWAInstall] Install error:', error);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or no install prompt available
  if (isInstalled || !deferredPrompt || !showPrompt) {
    return null;
  }

  // Check if user dismissed in this session
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'top-4 left-4 right-4';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      case 'bottom':
      default:
        return 'bottom-4 left-4 right-4';
    }
  };

  return (
    <AnimatePresence>
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
                  <Download className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Install Creaiter</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    PWA
                  </Badge>
                </div>
              </div>
              {showDismissButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="mb-4">
              Install our app for faster access, offline support, and a native experience.
            </CardDescription>
            
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                <span>Mobile friendly</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Monitor className="h-4 w-4" />
                <span>Desktop support</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="flex-1"
              >
                {isInstalling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Install App
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="px-3"
              >
                Later
              </Button>
            </div>

            <div className="mt-3 text-xs text-muted-foreground text-center">
              Installs locally on your device - no app store required
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Hook for programmatic PWA install prompt
 */
export const usePWAInstall = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInstalled = (window.navigator as any).standalone === true || isStandalone;
      setIsInstalled(isInstalled);
    };

    checkInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<'accepted' | 'dismissed' | null> => {
    if (!deferredPrompt) return null;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setIsInstallable(false);
      return choiceResult.outcome;
    } catch (error) {
      console.error('[PWAInstall] Install error:', error);
      return null;
    }
  };

  return {
    isInstallable,
    isInstalled,
    promptInstall
  };
};