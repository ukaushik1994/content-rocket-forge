import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, Loader2 } from 'lucide-react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';

interface SaveContentDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  content: string;
  onSave: (title: string, content: string) => Promise<void>;
  isSaving: boolean;
}

export const SaveContentDialog: React.FC<SaveContentDialogProps> = ({
  open,
  setOpen,
  title: initialTitle,
  content,
  onSave,
  isSaving
}) => {
  const [title, setTitle] = useState(initialTitle);
  const { state } = useContentBuilder();

  const handleSave = async () => {
    if (title.trim() === '') {
      alert('Title cannot be empty');
      return;
    }
    await onSave(title, content);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Save Content</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="keyword" className="text-right">
              Keyword
            </Label>
            <Input
              id="keyword"
              value={state.mainKeyword}
              className="col-span-3"
              disabled
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="content" className="text-right mt-2">
              Content
            </Label>
            <Textarea
              id="content"
              value={content}
              className="col-span-3"
              rows={5}
              disabled
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Content
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

