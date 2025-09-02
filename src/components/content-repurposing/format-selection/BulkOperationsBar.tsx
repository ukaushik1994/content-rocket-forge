
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckSquare, 
  Square, 
  Save, 
  Trash2
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
            {onSaveAll && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="icon"
                      onClick={onSaveAll}
                      disabled={isLoading || isSaving}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isSaving ? 'Saving...' : 'Save All'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
