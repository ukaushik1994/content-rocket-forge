
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PipelineItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  item?: any;
}

export const PipelineItemDialog = ({ open, onClose, onSave, item }: PipelineItemDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    stage: 'ideation',
    content_type: 'blog',
    priority: 'medium',
    target_keyword: '',
    word_count: 0,
    progress_percentage: 0,
    due_date: '',
    assigned_to: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        stage: item.stage || 'ideation',
        content_type: item.content_type || 'blog',
        priority: item.priority || 'medium',
        target_keyword: item.target_keyword || '',
        word_count: item.word_count || 0,
        progress_percentage: item.progress_percentage || 0,
        due_date: item.due_date || '',
        assigned_to: item.assigned_to || '',
        notes: item.notes || ''
      });
    } else {
      setFormData({
        title: '',
        stage: 'ideation',
        content_type: 'blog',
        priority: 'medium',
        target_keyword: '',
        word_count: 0,
        progress_percentage: 0,
        due_date: '',
        assigned_to: '',
        notes: ''
      });
    }
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving pipeline item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">
            {item ? 'Edit Pipeline Item' : 'Add Pipeline Item'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Content title"
              className="bg-gray-800 border-white/10 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stage" className="text-white">Stage</Label>
              <select
                id="stage"
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-md text-white"
              >
                <option value="ideation">Ideation</option>
                <option value="research">Research</option>
                <option value="writing">Writing</option>
                <option value="review">Review</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content_type" className="text-white">Content Type</Label>
              <select
                id="content_type"
                value={formData.content_type}
                onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-md text-white"
              >
                <option value="blog">Blog Post</option>
                <option value="social">Social Media</option>
                <option value="video">Video</option>
                <option value="email">Email</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-white">Priority</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-md text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date" className="text-white">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="bg-gray-800 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_keyword" className="text-white">Target Keyword</Label>
              <Input
                id="target_keyword"
                value={formData.target_keyword}
                onChange={(e) => setFormData({ ...formData, target_keyword: e.target.value })}
                placeholder="Main keyword to target"
                className="bg-gray-800 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="word_count" className="text-white">Target Word Count</Label>
              <Input
                id="word_count"
                type="number"
                min="0"
                value={formData.word_count}
                onChange={(e) => setFormData({ ...formData, word_count: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="bg-gray-800 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assigned_to" className="text-white">Assigned To</Label>
              <Input
                id="assigned_to"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                placeholder="Team member"
                className="bg-gray-800 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress_percentage" className="text-white">Progress (%)</Label>
              <Input
                id="progress_percentage"
                type="number"
                min="0"
                max="100"
                value={formData.progress_percentage}
                onChange={(e) => setFormData({ ...formData, progress_percentage: parseInt(e.target.value) || 0 })}
                className="bg-gray-800 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or requirements"
              className="bg-gray-800 border-white/10 text-white"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (item ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
