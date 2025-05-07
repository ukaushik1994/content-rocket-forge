
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileCheck, Loader2 } from 'lucide-react';

interface SaveContentDialogProps {
  showSaveDialog: boolean;
  setShowSaveDialog: (show: boolean) => void;
  saveTitle: string;
  setSaveTitle: (title: string) => void;
  saveNote: string;
  setSaveNote: (note: string) => void;
  handleSaveToDraft: () => Promise<void>;
  isSaving: boolean;
  mainKeyword: string;
  secondaryKeywords: string[];
  content: string;
  outlineLength: number;
}

export const SaveContentDialog: React.FC<SaveContentDialogProps> = ({
  showSaveDialog,
  setShowSaveDialog,
  saveTitle,
  setSaveTitle,
  saveNote,
  setSaveNote,
  handleSaveToDraft,
  isSaving,
  mainKeyword,
  secondaryKeywords,
  content,
  outlineLength
}) => {
  return (
    <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
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
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="Enter a title for this content"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="save-note">Note (Optional)</Label>
            <Textarea
              id="save-note"
              value={saveNote}
              onChange={(e) => setSaveNote(e.target.value)}
              placeholder="Add any notes or comments about this content"
              rows={3}
            />
          </div>

          <div className="pt-2">
            <Label className="text-xs text-muted-foreground">Content Details</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <span className="text-xs font-medium w-24">Main Keyword:</span>
                <span className="text-xs">{mainKeyword || "None"}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs font-medium w-24">Word Count:</span>
                <span className="text-xs">{content ? content.split(/\s+/).length : 0} words</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs font-medium w-24">Sections:</span>
                <span className="text-xs">{outlineLength}</span>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline" 
            onClick={() => setShowSaveDialog(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveToDraft}
            disabled={isSaving || !saveTitle.trim()}
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
