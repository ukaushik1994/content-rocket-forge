import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Undo2, 
  Redo2, 
  RotateCcw, 
  History, 
  Clock,
  FileText,
  Target
} from 'lucide-react';
import { useOptimizationHistory } from '../hooks/useOptimizationHistory';
import { formatDistanceToNow } from 'date-fns';

interface UndoRedoControlsProps {
  optimizationHistory: ReturnType<typeof useOptimizationHistory>;
  onUndo: () => void;
  onRedo: () => void;
  onRevert: (entryId: string) => void;
  className?: string;
}

export function UndoRedoControls({ 
  optimizationHistory, 
  onUndo, 
  onRedo, 
  onRevert,
  className = '' 
}: UndoRedoControlsProps) {
  const { getUndoRedoState, history, getHistoryPreview, getOptimizationStats } = optimizationHistory;
  const undoRedoState = getUndoRedoState();
  const stats = getOptimizationStats();

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'apply_suggestions':
        return <Target className="h-3 w-3" />;
      case 'bulk_select':
        return <History className="h-3 w-3" />;
      case 'manual_edit':
        return <FileText className="h-3 w-3" />;
      case 'optimization_complete':
        return <Target className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'apply_suggestions':
        return 'Applied Suggestions';
      case 'bulk_select':
        return 'Bulk Selection';
      case 'manual_edit':
        return 'Manual Edit';
      case 'optimization_complete':
        return 'Optimization Complete';
      case 'revert':
        return 'Reverted Changes';
      default:
        return action.replace('_', ' ');
    }
  };

  return (
    <TooltipProvider>
      <div className={`space-y-4 ${className}`}>
        {/* Main Undo/Redo Controls */}
        <div className="flex items-center gap-2 p-3 bg-background/40 rounded-xl border border-white/10 backdrop-blur-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onUndo}
                disabled={!undoRedoState.canUndo}
                className="flex items-center gap-2"
              >
                <Undo2 className="h-4 w-4" />
                Undo
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {undoRedoState.lastAction ? 
                `Undo: ${getActionLabel(undoRedoState.lastAction)}` : 
                'Nothing to undo'
              }
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRedo}
                disabled={!undoRedoState.canRedo}
                className="flex items-center gap-2"
              >
                <Redo2 className="h-4 w-4" />
                Redo
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Redo next action
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-4" />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <History className="h-3 w-3" />
            {undoRedoState.currentPosition + 1}/{undoRedoState.totalEntries}
          </div>
        </div>

        {/* History Statistics */}
        {stats.totalOptimizations > 0 && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="text-xs font-medium text-primary mb-2 flex items-center gap-2">
              <RotateCcw className="h-3 w-3" />
              Session Statistics
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Optimizations:</span>
                <span className="font-medium">{stats.totalOptimizations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg. Time:</span>
                <span className="font-medium">
                  {Math.round(stats.averageOptimizationTime / 1000)}s
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Recent History */}
        {history.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Recent Actions</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {history.slice(-5).reverse().map((entry, index) => {
                const preview = getHistoryPreview(entry.id);
                const isActive = history.length - 1 - index === undoRedoState.currentPosition;
                
                return (
                  <Tooltip key={entry.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={`p-2 rounded-lg border text-xs cursor-pointer transition-all hover:bg-background/60 ${
                          isActive 
                            ? 'border-primary/30 bg-primary/10' 
                            : 'border-white/10 bg-background/20'
                        }`}
                        onClick={() => onRevert(entry.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getActionIcon(entry.action)}
                            <span className="font-medium">
                              {getActionLabel(entry.action)}
                            </span>
                            {isActive && (
                              <Badge variant="outline" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          <span className="text-muted-foreground">
                            {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                        
                        {preview && (preview.contentChanges.charactersAdded !== 0 || preview.selectionChanges.added.length > 0) && (
                          <div className="mt-1 flex items-center gap-3 text-muted-foreground">
                            {preview.contentChanges.charactersAdded !== 0 && (
                              <span>
                                {preview.contentChanges.charactersAdded > 0 ? '+' : ''}
                                {preview.contentChanges.charactersAdded} chars
                              </span>
                            )}
                            {preview.selectionChanges.added.length > 0 && (
                              <span>+{preview.selectionChanges.added.length} selected</span>
                            )}
                            {preview.selectionChanges.removed.length > 0 && (
                              <span>-{preview.selectionChanges.removed.length} deselected</span>
                            )}
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <div className="text-xs">
                        <div className="font-medium">{getActionLabel(entry.action)}</div>
                        <div className="text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                        {preview && (
                          <div className="mt-1">
                            Click to revert to this point
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}