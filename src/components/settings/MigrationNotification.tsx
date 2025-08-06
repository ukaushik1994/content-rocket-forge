import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { migrateExistingAPIKeys } from '@/utils/migrateAIProviders';

export function MigrationNotification() {
  const [hasMigrated, setHasMigrated] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    // Check if migration has been done (simple localStorage flag)
    const migrationCompleted = localStorage.getItem('ai_providers_migrated');
    setHasMigrated(!!migrationCompleted);
  }, []);

  const handleMigration = async () => {
    setIsMigrating(true);
    try {
      await migrateExistingAPIKeys();
      localStorage.setItem('ai_providers_migrated', 'true');
      setHasMigrated(true);
      toast.success('AI providers migrated successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      toast.error('Migration failed. Please try again.');
    } finally {
      setIsMigrating(false);
    }
  };

  if (hasMigrated) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h4 className="font-medium text-green-900 dark:text-green-100">
                AI Providers Migrated
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your AI providers have been successfully migrated to the new system.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-amber-900 dark:text-amber-100">
              Migration Required
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
              We've improved AI provider management. Click below to migrate your existing API keys to the new system.
            </p>
            <Button 
              onClick={handleMigration}
              disabled={isMigrating}
              size="sm"
              className="gap-2"
            >
              {isMigrating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              {isMigrating ? 'Migrating...' : 'Migrate Now'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}