
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileCheck, Loader2 } from 'lucide-react';

interface SaveContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  setTitle: (title: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  isSaving: boolean;
}

export const ContentSaveDialog: React.FC<SaveContentDialogProps> = ({
  open,
  onOpenChange,
  title,
  setTitle,
  notes,
  setNotes,
  isSaving
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Save Content to Repository</DialogTitle>
          <DialogDescription>
            Save your content to access it later from the content repository.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="save-title">Content Title</Label>
            <Input
              id="save-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this content"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="save-notes">Notes (Optional)</Label>
            <Textarea
              id="save-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or comments about this content"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {}}
            disabled={isSaving || !title.trim()}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4" />
                Save to Repository
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
