import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { keywordLibraryService } from '@/services/keywordLibraryService';
import { toast } from 'sonner';

interface AddKeywordDialogProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export const AddKeywordDialog: React.FC<AddKeywordDialogProps> = ({ open, onClose, onAdded }) => {
  const [keyword, setKeyword] = useState('');
  const [volume, setVolume] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!keyword.trim()) return;
    try {
      setSaving(true);
      await keywordLibraryService.upsertKeyword({
        keyword: keyword.trim(),
        search_volume: volume ? parseInt(volume) : null,
        difficulty: difficulty ? parseInt(difficulty) : null,
        source_type: 'manual',
      });
      toast.success(`Keyword "${keyword.trim()}" added`);
      setKeyword('');
      setVolume('');
      setDifficulty('');
      onAdded();
      onClose();
    } catch (error) {
      console.error('Error adding keyword:', error);
      toast.error('Failed to add keyword');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add Keyword
          </DialogTitle>
          <DialogDescription>Add a keyword to your library manually.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="keyword">Keyword *</Label>
            <Input id="keyword" placeholder="e.g. content marketing" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="volume">Search Volume</Label>
              <Input id="volume" type="number" placeholder="Optional" value={volume} onChange={(e) => setVolume(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty (0-100)</Label>
              <Input id="difficulty" type="number" placeholder="Optional" min={0} max={100} value={difficulty} onChange={(e) => setDifficulty(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!keyword.trim() || saving}>
            {saving ? 'Adding...' : 'Add Keyword'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
