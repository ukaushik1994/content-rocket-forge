import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings, Download, RefreshCw, Database, TestTube, Loader2 } from 'lucide-react';
import { keywordMigrationService } from '@/services/keywordMigrationService';
import { toast } from 'sonner';

interface AdminActionsProps {
  onDataChange?: () => void;
}

export const AdminActions: React.FC<AdminActionsProps> = ({ onDataChange }) => {
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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