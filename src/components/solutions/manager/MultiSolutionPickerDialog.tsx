import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { CheckCircle2, Circle, Package } from 'lucide-react';

interface MultiSolutionPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solutions: Array<Partial<EnhancedSolution>>;
  onSelectSolutions: (selected: Array<Partial<EnhancedSolution>>) => void;
  websiteUrl?: string;
}

export const MultiSolutionPickerDialog: React.FC<MultiSolutionPickerDialogProps> = ({
  open,
  onOpenChange,
  solutions,
  onSelectSolutions,
  websiteUrl
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (solution: Partial<EnhancedSolution>) => {
    const id = solution.name || '';
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(solutions.map(s => s.name || '')));
  };

  const selectNone = () => {
    setSelectedIds(new Set());
  };

  const handleConfirm = () => {
    const selected = solutions.filter(s => selectedIds.has(s.name || ''));
    onSelectSolutions(selected);
    setSelectedIds(new Set());
  };

  const handleCancel = () => {
    setSelectedIds(new Set());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Multiple Solutions Detected
          </DialogTitle>
          <DialogDescription>
            We found {solutions.length} solution{solutions.length > 1 ? 's' : ''} from{' '}
            {websiteUrl ? new URL(websiteUrl).hostname : 'this website'}. 
            Select which ones to add to your library.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2">
          <div className="text-sm text-muted-foreground">
            {selectedIds.size} of {solutions.length} selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={selectNone}>
              Select None
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-3">
            {solutions.map((solution, index) => {
              const id = solution.name || '';
              const isSelected = selectedIds.has(id);
              const confidence = solution.metadata?.completeness || 85;

              return (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => toggleSelection(solution)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {isSelected ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-base">{solution.name}</h4>
                            {solution.category && (
                              <Badge variant="secondary" className="mt-1">
                                {solution.category}
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {confidence}% confidence
                          </Badge>
                        </div>

                        {solution.shortDescription && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {solution.shortDescription}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {solution.features && solution.features.length > 0 && (
                            <span>✓ {solution.features.length} features</span>
                          )}
                          {solution.useCases && solution.useCases.length > 0 && (
                            <span>• {solution.useCases.length} use cases</span>
                          )}
                          {solution.pricing && (
                            <span>• Pricing data available</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedIds.size === 0}
          >
            Add Selected ({selectedIds.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
