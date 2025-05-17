
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Label } from '@/components/ui/label';

interface SaveContentDialogProps {
  showSaveDialog: boolean;
  setShowSaveDialog: React.Dispatch<React.SetStateAction<boolean>>;
  saveTitle: string;
  setSaveTitle: React.Dispatch<React.SetStateAction<string>>;
  saveNote: string;
  setSaveNote: React.Dispatch<React.SetStateAction<string>>;
  handleSaveToDraft: () => Promise<void>;
  isSaving: boolean;
  mainKeyword: string;
  secondaryKeywords: string[];
  content: string;
  outlineLength: number;
}

export function SaveContentDialog({
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
}: SaveContentDialogProps) {
  const { state } = useContentBuilder();
  const { serpSelections } = state;

  // Get selected SERP items count
  const selectedSerpCount = serpSelections ? serpSelections.filter(item => item.selected).length : 0;

  return (
    <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Content to Drafts</DialogTitle>
          <DialogDescription>
            Save your content as a draft to continue working on it later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Content Title</Label>
            <Input 
              id="title"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="Enter title for your content"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={saveNote}
              onChange={(e) => setSaveNote(e.target.value)}
              placeholder="Add any notes about this draft..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label>Content Summary</Label>
            <div className="bg-muted p-3 rounded-md mt-1 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Content Length:</span>
                <span>{content.length} characters</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Main Keyword:</span>
                <Badge variant="outline">{mainKeyword}</Badge>
              </div>
              {secondaryKeywords.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Secondary Keywords:</span>
                  <span>{secondaryKeywords.length}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Outline Sections:</span>
                <span>{outlineLength}</span>
              </div>
              {selectedSerpCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SERP Selections:</span>
                  <span>{selectedSerpCount}</span>
                </div>
              )}
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
          >
            {isSaving ? 'Saving...' : 'Save to Drafts'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
