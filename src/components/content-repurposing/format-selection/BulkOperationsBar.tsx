
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
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={isAllSelected ? onClearAll : onSelectAll}
            disabled={isLoading}
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
          
          <span className="text-sm text-muted-foreground">
            {selectedCount} of {totalCount} selected
          </span>
          
          {generatedCount > 0 && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm text-muted-foreground">
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
              variant="outline"
              size="sm"
              onClick={onCopyAll}
              disabled={isLoading}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy All
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onExportAll}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-1" />
              Export All
            </Button>
            
            {onSaveAll && (
              <Button
                variant="outline"
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
                variant="outline"
                size="sm"
                onClick={onDeleteAll}
                disabled={isLoading}
                className="text-destructive hover:text-destructive"
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
