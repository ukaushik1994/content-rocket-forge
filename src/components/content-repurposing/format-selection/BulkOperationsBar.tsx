
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  CheckSquare, 
  Square, 
  Download, 
  Save, 
  Trash2, 
  Copy,
  FileText 
} from 'lucide-react';

interface BulkOperationsBarProps {
  selectedCount: number;
  totalCount: number;
  generatedCount: number;
  onSelectAll: () => void;
  onClearAll: () => void;
  onSaveAll?: () => void;
  onDeleteAll?: () => void;
  onExportAll?: () => void;
  onCopyAll?: () => void;
  isLoading?: boolean;
  isSaving?: boolean;
}

export const BulkOperationsBar: React.FC<BulkOperationsBarProps> = ({
  selectedCount,
  totalCount,
  generatedCount,
  onSelectAll,
  onClearAll,
  onSaveAll,
  onDeleteAll,
  onExportAll,
  onCopyAll,
  isLoading = false,
  isSaving = false
}) => {
  const isAllSelected = selectedCount === totalCount;
  const hasSelection = selectedCount > 0;
  const hasGenerated = generatedCount > 0;

  return (
    <div className="flex items-center justify-between p-3 bg-card/80 backdrop-blur-sm rounded-lg border border-border/50 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={isAllSelected ? onClearAll : onSelectAll}
            disabled={isLoading}
            className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
          >
            {isAllSelected ? (
              <>
                <Square className="h-4 w-4 mr-1" />
                Clear All
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 mr-1" />
                Select All
              </>
            )}
          </Button>
          
          <span className="text-sm text-foreground/80 font-medium">
            {selectedCount} of {totalCount} selected
          </span>
          
          {generatedCount > 0 && (
            <>
              <Separator orientation="vertical" className="h-4 bg-border/60" />
              <span className="text-sm text-foreground/70 font-medium">
                {generatedCount} generated
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {hasGenerated && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={onCopyAll}
              disabled={isLoading}
              className="bg-card hover:bg-accent text-foreground border-border"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy All
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={onExportAll}
              disabled={isLoading}
              className="bg-card hover:bg-accent text-foreground border-border"
            >
              <Download className="h-4 w-4 mr-1" />
              Export All
            </Button>
            
            {onSaveAll && (
              <Button
                variant="default"
                size="sm"
                onClick={onSaveAll}
                disabled={isLoading || isSaving}
              >
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? 'Saving...' : 'Save All'}
              </Button>
            )}
            
            {onDeleteAll && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onDeleteAll}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete All
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BulkOperationsBar;
