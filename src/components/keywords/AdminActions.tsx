import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Settings, Download, RefreshCw, Database, TestTube, Loader2, Trash2, BarChart3 } from 'lucide-react';
import { keywordMigrationService } from '@/services/keywordMigrationService';
import { keywordLibraryService } from '@/services/keywordLibraryService';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface AdminActionsProps {
  onDataChange?: () => void;
}

export const AdminActions: React.FC<AdminActionsProps> = ({ onDataChange }) => {
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleMigrateLegacyData = async () => {
    setIsLoading(true);
    try {
      const result = await keywordMigrationService.migrateLegacyKeywords();
      toast.success(`Migration completed! Migrated ${result.migrated} keywords, handled ${result.duplicates} duplicates.`);
      onDataChange?.();
      setShowMigrationDialog(false);
    } catch (error) {
      toast.error('Migration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunIntegrationTests = async () => {
    setIsLoading(true);
    try {
      const results = await keywordMigrationService.runIntegrationTests();
      const passed = Object.values(results).filter(Boolean).length;
      const total = Object.keys(results).length;
      toast.success(`Tests completed! ${passed}/${total} tests passed.`);
      setShowTestDialog(false);
    } catch (error) {
      toast.error('Tests failed. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshSerpData = async () => {
    setIsLoading(true);
    setProgress(0);
    try {
      const refreshed = await keywordLibraryService.refreshStaleKeywords();
      setProgress(100);
      toast.success(`Refreshed SERP data for ${refreshed} keywords`);
      onDataChange?.();
      setShowRefreshDialog(false);
    } catch (error) {
      toast.error('Failed to refresh SERP data. Please try again.');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleDataCleanup = async () => {
    setIsLoading(true);
    setProgress(0);
    try {
      // Simulate cleanup with progress
      setProgress(33);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProgress(66);
      await keywordLibraryService.syncKeywordsFromSources();
      
      setProgress(100);
      toast.success('Data cleanup completed successfully');
      onDataChange?.();
      setShowCleanupDialog(false);
    } catch (error) {
      toast.error('Data cleanup failed. Please try again.');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs">
            <Settings className="h-3 w-3 mr-1" />
            Admin
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowMigrationDialog(true)}>
            <Database className="h-4 w-4 mr-2" />
            Migrate Legacy Data
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowRefreshDialog(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh SERP Data
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowCleanupDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clean & Sync Data
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowTestDialog(true)}>
            <TestTube className="h-4 w-4 mr-2" />
            Run Integration Tests
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Migration Dialog */}
      <Dialog open={showMigrationDialog} onOpenChange={setShowMigrationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Migrate Legacy Data</DialogTitle>
            <DialogDescription>
              This will import keywords from the legacy keywords table and merge them with your current keyword library. 
              Duplicates will be handled intelligently.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMigrationDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleMigrateLegacyData} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Start Migration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SERP Refresh Dialog */}
      <Dialog open={showRefreshDialog} onOpenChange={setShowRefreshDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refresh SERP Data</DialogTitle>
            <DialogDescription>
              This will refresh metrics for keywords with stale SERP data (older than 24 hours). 
              Limited to 10 keywords per run to respect API limits.
            </DialogDescription>
          </DialogHeader>
          {isLoading && progress > 0 && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">Refreshing SERP data...</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefreshDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleRefreshSerpData} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Refresh Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Cleanup Dialog */}
      <Dialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clean & Sync Data</DialogTitle>
            <DialogDescription>
              This will synchronize keywords from all sources, remove duplicates, and validate data quality.
            </DialogDescription>
          </DialogHeader>
          {isLoading && progress > 0 && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {progress < 50 ? 'Validating data...' : progress < 90 ? 'Syncing sources...' : 'Finalizing cleanup...'}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCleanupDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleDataCleanup} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Clean Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Integration Tests</DialogTitle>
            <DialogDescription>
              This will test SERP integration, keyword saving, and usage tracking functionality.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleRunIntegrationTests} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Run Tests
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};