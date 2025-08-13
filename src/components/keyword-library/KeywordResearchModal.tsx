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
import { Search, Plus } from 'lucide-react';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { keywordLibraryService } from '@/services/keywordLibraryService';
import { toast } from 'sonner';

interface KeywordResearchModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const KeywordResearchModal: React.FC<KeywordResearchModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [keyword, setKeyword] = useState('');
  const [researching, setResearching] = useState(false);

  const handleResearch = async () => {
    if (!keyword.trim()) return;

    try {
      setResearching(true);
      const serpData = await analyzeKeywordSerp(keyword.trim());
      
      if (serpData) {
        await keywordLibraryService.upsertKeyword({
          keyword: keyword.trim(),
          search_volume: serpData.searchVolume,
          difficulty: serpData.keywordDifficulty,
          source_type: 'serp'
        });
        
        toast.success('Keyword researched and added successfully');
        setKeyword('');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Research error:', error);
      toast.error('Failed to research keyword');
    } finally {
      setResearching(false);
    }
  };

  const handleAddManual = async () => {
    if (!keyword.trim()) return;

    try {
      await keywordLibraryService.upsertKeyword({
        keyword: keyword.trim(),
        source_type: 'manual'
      });
      
      toast.success('Keyword added successfully');
      setKeyword('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Add error:', error);
      toast.error('Failed to add keyword');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Research Keywords</DialogTitle>
          <DialogDescription>
            Research keywords using SERP data or add them manually to your library.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="keyword">Keyword</Label>
            <Input
              id="keyword"
              placeholder="Enter keyword to research..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleResearch()}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleAddManual} disabled={!keyword.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Manual
          </Button>
          <Button 
            onClick={handleResearch} 
            disabled={!keyword.trim() || researching}
          >
            <Search className="h-4 w-4 mr-2" />
            {researching ? 'Researching...' : 'Research via SERP'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};