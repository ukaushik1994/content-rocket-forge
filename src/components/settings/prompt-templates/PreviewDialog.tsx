
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PromptTemplate } from '@/services/userPreferencesService';
import { getFormatTypeLabel } from './types';

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: PromptTemplate | null;
  onEdit: () => void;
}

export const PreviewDialog: React.FC<PreviewDialogProps> = ({
  open,
  onOpenChange,
  template,
  onEdit
}) => {
  if (!template) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
          <DialogDescription>
            Template preview for {getFormatTypeLabel(template.formatType || '')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Prompt Template</Label>
            <div className="bg-muted rounded-md p-4 overflow-auto max-h-[200px]">
              <pre className="text-sm whitespace-pre-wrap">{template.promptTemplate}</pre>
            </div>
          </div>
          
          {template.structureTemplate && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Structure Template</Label>
              <div className="bg-muted rounded-md p-4 overflow-auto max-h-[200px]">
                <pre className="text-sm whitespace-pre-wrap">{template.structureTemplate}</pre>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={onEdit}>Edit Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
