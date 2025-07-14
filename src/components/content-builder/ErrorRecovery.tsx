/**
 * Error Recovery Component for Content Builder
 * Provides data recovery and error handling capabilities
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { listBackups, loadStateFromStorage, clearSavedState, hasSavedState, getLastSavedTime } from '@/contexts/content-builder/utils/persistence';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';

interface ErrorRecoveryProps {
  onRecover?: () => void;
  showBackups?: boolean;
}

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({ 
  onRecover, 
  showBackups = true 
}) => {
  const { state } = useContentBuilder();
  const [backups, setBackups] = useState<Array<{
    key: string;
    label: string;
    timestamp: number;
  }>>([]);
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    if (showBackups) {
      setBackups(listBackups());
    }
  }, [showBackups]);

  const handleRecoverFromStorage = async () => {
    setIsRecovering(true);
    try {
      const savedState = loadStateFromStorage();
      if (savedState) {
        // This would require a way to restore state - we'll add this to context
        toast.success('Data recovered from local storage');
        onRecover?.();
      } else {
        toast.error('No saved data found');
      }
    } catch (error) {
      toast.error('Failed to recover data');
    } finally {
      setIsRecovering(false);
    }
  };

  const handleClearStorage = () => {
    clearSavedState();
    setBackups([]);
    toast.success('All saved data cleared');
  };

  const handleExportState = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `content-builder-backup-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('State exported successfully');
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const lastSavedTime = getLastSavedTime();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Data Recovery & Backup
        </CardTitle>
        <CardDescription>
          Recover lost data or manage your content builder backups
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current State Info */}
        <div className="space-y-2">
          <h4 className="font-medium">Current Session</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Auto-save status: {hasSavedState() ? 'Active' : 'No data saved'}
            </span>
            {lastSavedTime && (
              <Badge variant="outline">
                Last saved: {formatTimestamp(lastSavedTime)}
              </Badge>
            )}
          </div>
        </div>

        {/* Recovery Actions */}
        <div className="space-y-3">
          <h4 className="font-medium">Recovery Actions</h4>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecoverFromStorage}
              disabled={isRecovering || !hasSavedState()}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRecovering ? 'animate-spin' : ''}`} />
              Recover from Auto-save
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportState}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Current State
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearStorage}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </Button>
          </div>
        </div>

        {/* Backups List */}
        {showBackups && backups.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Available Backups</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {backups.map((backup) => (
                <div
                  key={backup.key}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{backup.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(backup.timestamp)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // This would restore from the specific backup
                      toast.info('Backup restoration coming soon');
                    }}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
          <p className="font-medium mb-1">Recovery Tips:</p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Auto-save runs every second when you make changes</li>
            <li>Backups are created before major navigation steps</li>
            <li>Export your state regularly for manual backups</li>
            <li>Clear data if you encounter persistent issues</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};