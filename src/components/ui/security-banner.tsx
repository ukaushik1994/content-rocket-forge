
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { migrateAllUserKeys } from '@/services/apiKeyService';

interface SecurityBannerProps {
  type: 'migration' | 'demo' | 'security-warning';
  onDismiss?: () => void;
  onAction?: () => void;
}

export function SecurityBanner({ type, onDismiss, onAction }: SecurityBannerProps) {
  const handleMigrateKeys = async () => {
    await migrateAllUserKeys();
    if (onAction) onAction();
  };

  if (type === 'migration') {
    return (
      <Alert className="border-amber-200 bg-amber-50 text-amber-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Your API keys need to be updated for enhanced security. This is a one-time update.
          </span>
          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              variant="outline"
              onClick={handleMigrateKeys}
              className="border-amber-300 text-amber-800 hover:bg-amber-100"
            >
              Update Now
            </Button>
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="text-amber-600 hover:bg-amber-100"
              >
                Later
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (type === 'demo') {
    return (
      <Alert className="border-blue-200 bg-blue-50 text-blue-800">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          You're using a demo account. Some features may be limited for security purposes.
          <Button
            size="sm"
            variant="link"
            className="text-blue-600 p-0 ml-1 h-auto"
            onClick={() => window.location.href = '/auth/signup'}
          >
            Create your own account
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (type === 'security-warning') {
    return (
      <Alert className="border-red-200 bg-red-50 text-red-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Security notice: Please verify your account settings and API key configurations.
          </span>
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-red-600 hover:bg-red-100"
            >
              Dismiss
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
