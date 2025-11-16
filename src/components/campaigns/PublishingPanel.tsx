import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Globe, CheckCircle2 } from 'lucide-react';
import { publishToWebsite } from '@/services/publishing/publishingService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ContentItemType } from '@/contexts/content/types';

interface PublishingPanelProps {
  campaignId: string;
  contentItems: ContentItemType[];
  onPublishComplete?: () => void;
}

export const PublishingPanel = ({ campaignId, contentItems, onPublishComplete }: PublishingPanelProps) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [publishDate, setPublishDate] = useState<Date>();
  const [platform, setPlatform] = useState<'wordpress' | 'wix' | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedItems, setPublishedItems] = useState<Set<string>>(new Set());

  const unpublishedItems = contentItems.filter(item => 
    item.approval_status === 'approved'
  );

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const publishSelected = async () => {
    if (selectedItems.size === 0) {
      toast.error('Please select content to publish');
      return;
    }

    if (!platform) {
      toast.error('Please select a publishing platform');
      return;
    }

    setIsPublishing(true);
    const published = new Set<string>();
    let successCount = 0;
    let failCount = 0;

    for (const itemId of selectedItems) {
      const item = contentItems.find(c => c.id === itemId);
      if (!item) continue;

      try {
        const result = await publishToWebsite({
          title: item.title,
          contentMd: item.content || '',
          excerpt: item.meta_description || '',
          status: publishDate ? 'future' : 'publish',
          scheduledAt: publishDate,
          categories: item.keywords || [],
        });

        if (result.ok) {
          // Update content item with publication info
          await supabase
            .from('content_items')
            .update({
              published_at: publishDate || new Date().toISOString(),
              metadata: {
                ...item.metadata,
                published_url: result.url,
                published_platform: platform,
              }
            })
            .eq('id', itemId);

          published.add(itemId);
          successCount++;
        } else {
          failCount++;
          console.error(`Failed to publish ${item.title}:`, result.error);
        }
      } catch (error) {
        failCount++;
        console.error(`Error publishing ${item.title}:`, error);
      }
    }

    setIsPublishing(false);
    setPublishedItems(prev => new Set([...prev, ...published]));
    setSelectedItems(new Set());

    if (successCount > 0) {
      toast.success(`Successfully published ${successCount} item(s)`);
    }
    if (failCount > 0) {
      toast.error(`Failed to publish ${failCount} item(s)`);
    }

    onPublishComplete?.();
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Publish Campaign Content</h3>
          <p className="text-sm text-muted-foreground">
            Select content to publish to your website. Only approved content can be published.
          </p>
        </div>

        {unpublishedItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No content available for publishing</p>
            <p className="text-sm">All content must be approved before publishing</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <label className="text-sm font-medium">Select Platform</label>
              <Select value={platform || ''} onValueChange={(v) => setPlatform(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose publishing platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wordpress">WordPress</SelectItem>
                  <SelectItem value="wix">Wix</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Schedule Date (Optional)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {publishDate ? format(publishDate, 'PPP') : 'Publish immediately'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={publishDate}
                    onSelect={setPublishDate}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select Content ({selectedItems.size} selected)
              </label>
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {unpublishedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 hover:bg-accent/50 cursor-pointer flex items-start gap-3"
                    onClick={() => toggleItem(item.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleItem(item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.content_type || 'Article'} • {item.content?.split(/\s+/).length || 0} words
                      </div>
                    </div>
                    {publishedItems.has(item.id) && (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={publishSelected}
              disabled={selectedItems.size === 0 || !platform || isPublishing}
              className="w-full"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing {selectedItems.size} item(s)...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Publish {selectedItems.size} Selected
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};
