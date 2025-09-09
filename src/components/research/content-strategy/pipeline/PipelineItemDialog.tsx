
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PipelineItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  item?: any;
}

export const PipelineItemDialog: React.FC<PipelineItemDialogProps> = ({
  open,
  onClose,
  onSave,
  item
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    stage: 'to_be_written',
    content_type: 'blog',
    target_keyword: '',
    word_count: 0,
    seo_score: 0,
    progress_percentage: 0,
    due_date: '',
    assigned_to: '',
    priority: 'medium',
    blockers: [] as string[],
    notes: ''
  });
  const [newBlocker, setNewBlocker] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        stage: item.stage || 'to_be_written',
        content_type: item.content_type || 'blog',
        target_keyword: item.target_keyword || '',
        word_count: item.word_count || 0,
        seo_score: item.seo_score || 0,
        progress_percentage: item.progress_percentage || 0,
        due_date: item.due_date || '',
        assigned_to: item.assigned_to || '',
        priority: item.priority || 'medium',
        blockers: item.blockers || [],
        notes: item.notes || ''
      });
    }
  }, [item]);

  const handleSave = async () => {
    if (!formData.title.trim()) return;

    setIsLoading(true);
    try {
      await onSave({
        ...formData,
        user_id: user?.id
      });
      onClose();
      setFormData({
        title: '',
        stage: 'to_be_written',
        content_type: 'blog',
        target_keyword: '',
        word_count: 0,
        seo_score: 0,
        progress_percentage: 0,
        due_date: '',
        assigned_to: '',
        priority: 'medium',
        blockers: [],
        notes: ''
      });
    } catch (error) {
      console.error('Error saving pipeline item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addBlocker = () => {
    if (newBlocker.trim() && !formData.blockers.includes(newBlocker.trim())) {
      setFormData(prev => ({
        ...prev,
        blockers: [...prev.blockers, newBlocker.trim()]
      }));
      setNewBlocker('');
    }
  };

  const removeBlocker = (blockerToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      blockers: prev.blockers.filter(blocker => blocker !== blockerToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBlocker();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-white/20 text-white max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {item ? 'Edit Pipeline Item' : 'Add Pipeline Item'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-white">Title</Label>
            <Input
              id="title"
              placeholder="Enter content title..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stage" className="text-white">Stage</Label>
              <Select
                value={formData.stage}
                onValueChange={(value) => setFormData(prev => ({ ...prev, stage: value }))}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-white/20">
                  <SelectItem value="to_be_written">To Be Written</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="content_type" className="text-white">Content Type</Label>
              <Select
                value={formData.content_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, content_type: value }))}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-white/20">
                  <SelectItem value="blog">📝 Blog Post</SelectItem>
                  <SelectItem value="social">📱 Social Media</SelectItem>
                  <SelectItem value="video">🎬 Video</SelectItem>
                  <SelectItem value="email">✉️ Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="target_keyword" className="text-white">Target Keyword</Label>
            <Input
              id="target_keyword"
              placeholder="Enter target keyword..."
              value={formData.target_keyword}
              onChange={(e) => setFormData(prev => ({ ...prev, target_keyword: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="word_count" className="text-white">Word Count</Label>
              <Input
                id="word_count"
                type="number"
                min="0"
                placeholder="0"
                value={formData.word_count || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, word_count: parseInt(e.target.value) || 0 }))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <Label htmlFor="seo_score" className="text-white">SEO Score</Label>
              <Input
                id="seo_score"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={formData.seo_score || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, seo_score: parseInt(e.target.value) || 0 }))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-white">Progress: {formData.progress_percentage}%</Label>
            <Slider
              value={[formData.progress_percentage]}
              onValueChange={(value) => setFormData(prev => ({ ...prev, progress_percentage: value[0] }))}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="due_date" className="text-white">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <Label htmlFor="priority" className="text-white">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-white/20">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="assigned_to" className="text-white">Assigned To</Label>
            <Input
              id="assigned_to"
              placeholder="Enter assignee name..."
              value={formData.assigned_to}
              onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>

          <div>
            <Label htmlFor="blockers" className="text-white">Blockers</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add a blocker..."
                value={newBlocker}
                onChange={(e) => setNewBlocker(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <Button onClick={addBlocker} size="sm" variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.blockers.map((blocker, index) => (
                <Badge key={index} variant="secondary" className="bg-red-500/20 text-red-400">
                  {blocker}
                  <button
                    onClick={() => removeBlocker(blocker)}
                    className="ml-1 hover:text-red-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-white">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or description..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[80px]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!formData.title.trim() || isLoading}
            className="bg-primary/20 hover:bg-primary/30"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
