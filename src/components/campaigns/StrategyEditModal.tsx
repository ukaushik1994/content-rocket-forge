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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CampaignStrategy, ContentFormatCount } from '@/types/campaign-types';
import { contentFormats } from '@/components/content-repurposing/formats';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { sanitizeHtml } from '@/utils/inputValidation';
import { toast } from 'sonner';

interface StrategyEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategy: CampaignStrategy;
  onSave: (updatedStrategy: CampaignStrategy) => void;
}

export function StrategyEditModal({
  open,
  onOpenChange,
  strategy,
  onSave,
}: StrategyEditModalProps) {
  const [editedStrategy, setEditedStrategy] = useState<CampaignStrategy>(strategy);

  const updateContentCount = (formatId: string, delta: number) => {
    setEditedStrategy((prev) => ({
      ...prev,
      contentMix: prev.contentMix.map((item) =>
        item.formatId === formatId
          ? { ...item, count: Math.max(1, item.count + delta) }
          : item
      ),
    }));
  };

  const removeFormat = (formatId: string) => {
    setEditedStrategy((prev) => ({
      ...prev,
      contentMix: prev.contentMix.filter((item) => item.formatId !== formatId),
    }));
  };

  const addFormat = (formatId: string) => {
    const newItem: ContentFormatCount = {
      formatId,
      count: 1,
      scheduleSuggestion: '',
    };
    setEditedStrategy((prev) => ({
      ...prev,
      contentMix: [...prev.contentMix, newItem],
    }));
  };

  const updateSchedule = (formatId: string, schedule: string) => {
    const sanitized = sanitizeHtml(schedule).substring(0, 100);
    setEditedStrategy((prev) => ({
      ...prev,
      contentMix: prev.contentMix.map((item) =>
        item.formatId === formatId
          ? { ...item, scheduleSuggestion: sanitized }
          : item
      ),
    }));
  };

  const availableFormats = contentFormats.filter(
    (format) => !editedStrategy.contentMix.some((item) => item.formatId === format.id)
  );

  const totalContent = editedStrategy.contentMix.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const handleSave = () => {
    // Validate minimum content
    if (totalContent < 3) {
      toast.error('Strategy must have at least 3 content pieces');
      return;
    }
    
    // Sanitize all text fields before saving
    const sanitizedStrategy = {
      ...editedStrategy,
      title: sanitizeHtml(editedStrategy.title).substring(0, 200),
      contentMix: editedStrategy.contentMix.map(item => ({
        ...item,
        scheduleSuggestion: sanitizeHtml(item.scheduleSuggestion || '').substring(0, 100)
      }))
    };
    
    onSave(sanitizedStrategy);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Customize Your Strategy</DialogTitle>
          <DialogDescription>
            Adjust content counts, formats, and posting schedules
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {/* Strategy name */}
            <div className="space-y-2">
              <Label htmlFor="title">Strategy Name</Label>
              <Input
                id="title"
                value={editedStrategy.title}
                maxLength={200}
                onChange={(e) =>
                  setEditedStrategy((prev) => ({ 
                    ...prev, 
                    title: sanitizeHtml(e.target.value).substring(0, 200)
                  }))
                }
              />
            </div>

            {/* Content Mix Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Content Mix ({totalContent} total pieces)</Label>
                {totalContent < 3 && (
                  <span className="text-xs text-destructive">
                    Minimum 3 content pieces required
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {editedStrategy.contentMix.map((item) => {
                  const format = contentFormats.find((f) => f.id === item.formatId);
                  const FormatIcon = format?.icon;

                  return (
                    <div
                      key={item.formatId}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                    >
                      {FormatIcon && <FormatIcon className="h-5 w-5 text-primary" />}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{format?.name}</p>
                        <Input
                          placeholder="Posting schedule (e.g., '2 per week')"
                          value={item.scheduleSuggestion || ''}
                          onChange={(e) =>
                            updateSchedule(item.formatId, e.target.value)
                          }
                          className="mt-1 h-8 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateContentCount(item.formatId, -1)}
                          disabled={item.count <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.count}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateContentCount(item.formatId, 1)}
                          disabled={totalContent >= 20}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeFormat(item.formatId)}
                          disabled={editedStrategy.contentMix.length <= 2}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add format */}
              {availableFormats.length > 0 && (
                <div className="flex items-center gap-2">
                  <Select onValueChange={addFormat}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Add another format..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFormats.map((format) => (
                        <SelectItem key={format.id} value={format.id}>
                          {format.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Meta fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  value={editedStrategy.timeline || ''}
                  onChange={(e) =>
                    setEditedStrategy((prev) => ({
                      ...prev,
                      timeline: e.target.value,
                    }))
                  }
                  placeholder="e.g., 4 weeks"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reach">Estimated Reach</Label>
                <Input
                  id="reach"
                  value={editedStrategy.estimatedReach || ''}
                  onChange={(e) =>
                    setEditedStrategy((prev) => ({
                      ...prev,
                      estimatedReach: e.target.value,
                    }))
                  }
                  placeholder="e.g., 10K-25K impressions"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={totalContent < 3 || editedStrategy.contentMix.length < 2}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
