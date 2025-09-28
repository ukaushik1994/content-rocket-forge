import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Edit,
  Download,
  Trash2,
  RefreshCw,
  FileText,
  Database,
  Zap,
  ChevronDown,
  Upload,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedBulkActionsProps {
  selectedCount: number;
  onAction: (action: string, data?: any) => void;
}

interface BulkEditData {
  search_volume?: number;
  difficulty?: number;
  notes?: string;
  source_type?: string;
}

export const EnhancedBulkActions: React.FC<EnhancedBulkActionsProps> = ({
  selectedCount,
  onAction
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [bulkEditData, setBulkEditData] = useState<BulkEditData>({});
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'xlsx'>('csv');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleBulkSerpRefresh = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      // Simulate progress for SERP refresh
      const interval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onAction('bulk_serp_refresh');
      
      clearInterval(interval);
      setProcessingProgress(100);
      
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingProgress(0);
      }, 1000);
      
      toast.success(`SERP data refreshed for ${selectedCount} keywords`);
    } catch (error) {
      setIsProcessing(false);
      setProcessingProgress(0);
      toast.error('Failed to refresh SERP data');
    }
  };

  const handleBulkEdit = async () => {
    try {
      await onAction('bulk_edit', bulkEditData);
      setShowBulkEdit(false);
      setBulkEditData({});
      toast.success(`Updated ${selectedCount} keywords`);
    } catch (error) {
      toast.error('Failed to update keywords');
    }
  };

  const handleExport = async () => {
    try {
      await onAction('export', { format: exportFormat });
      setShowExportDialog(false);
      toast.success(`Exported ${selectedCount} keywords as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export keywords');
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAction('import', { file });
      setShowImportDialog(false);
      toast.success('Import started - processing file...');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
            <Database className="h-4 w-4 mr-2" />
            Bulk Actions ({selectedCount})
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {/* Research & Data */}
          <DropdownMenuItem onClick={handleBulkSerpRefresh} disabled={isProcessing}>
            <Search className="h-4 w-4 mr-2" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span>Refresh SERP Data</span>
                <Badge variant="outline" className="text-xs border-info/30 text-info">
                  Research
                </Badge>
              </div>
              {isProcessing && (
                <Progress value={processingProgress} className="h-1 mt-1" />
              )}
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowBulkEdit(true)}>
            <Edit className="h-4 w-4 mr-2" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span>Edit Details</span>
                <Badge variant="outline" className="text-xs border-warning/30 text-warning">
                  Batch
                </Badge>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onAction('add_to_strategy')}>
            <Tag className="h-4 w-4 mr-2" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span>Add to Strategy</span>
                <Badge variant="outline" className="text-xs border-success/30 text-success">
                  Plan
                </Badge>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Export Options */}
          <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span>Export Keywords</span>
                <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                  Data
                </Badge>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowImportDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span>Import from File</span>
                <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                  Bulk
                </Badge>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Destructive Actions */}
          <DropdownMenuItem 
            onClick={() => setShowDeleteConfirm(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span>Delete Selected</span>
                <Badge variant="outline" className="text-xs border-destructive/30 text-destructive">
                  Danger
                </Badge>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Keywords
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCount} selected keyword(s)? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                onAction('delete');
                setShowDeleteConfirm(false);
              }}
            >
              Delete {selectedCount} Keywords
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={showBulkEdit} onOpenChange={setShowBulkEdit}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Bulk Edit Keywords
            </DialogTitle>
            <DialogDescription>
              Update {selectedCount} selected keywords. Leave fields empty to keep existing values.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="search_volume">Search Volume</Label>
              <Input
                id="search_volume"
                type="number"
                placeholder="e.g., 1000"
                value={bulkEditData.search_volume || ''}
                onChange={(e) => setBulkEditData(prev => ({
                  ...prev,
                  search_volume: e.target.value ? parseInt(e.target.value) : undefined
                }))}
              />
            </div>
            
            <div>
              <Label htmlFor="difficulty">Keyword Difficulty</Label>
              <Input
                id="difficulty"
                type="number"
                min="0"
                max="100"
                placeholder="e.g., 45"
                value={bulkEditData.difficulty || ''}
                onChange={(e) => setBulkEditData(prev => ({
                  ...prev,
                  difficulty: e.target.value ? parseInt(e.target.value) : undefined
                }))}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add notes for all selected keywords..."
                value={bulkEditData.notes || ''}
                onChange={(e) => setBulkEditData(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkEdit(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkEdit}>
              Update {selectedCount} Keywords
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Export Keywords
            </DialogTitle>
            <DialogDescription>
              Export {selectedCount} selected keywords in your preferred format.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Export Format</Label>
              <div className="flex gap-2 mt-2">
                {(['csv', 'json', 'xlsx'] as const).map((format) => (
                  <Button
                    key={format}
                    variant={exportFormat === format ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setExportFormat(format)}
                  >
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export as {exportFormat.toUpperCase()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Import Keywords
            </DialogTitle>
            <DialogDescription>
              Import keywords from a CSV, JSON, or Excel file. The file should contain columns for keyword, search_volume, and difficulty.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-import">Select File</Label>
              <Input
                id="file-import"
                type="file"
                accept=".csv,.json,.xlsx,.xls"
                onChange={handleFileImport}
                className="mt-2"
              />
            </div>
            
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <strong>Supported formats:</strong> CSV, JSON, Excel (.xlsx, .xls)
              <br />
              <strong>Required columns:</strong> keyword (required), search_volume, difficulty, notes
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};