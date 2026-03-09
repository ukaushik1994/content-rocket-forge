import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CampaignStrategy } from '@/types/campaign-types';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, Film } from 'lucide-react';
import { VideoPlaceholder } from '@/components/content/VideoPlaceholder';

interface ContentPreviewModalProps {
  strategy: CampaignStrategy;
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedFormats: string[]) => void;
}

const formatLabels: Record<string, string> = {
  'blog': 'Blog Posts',
  'social-twitter': 'Twitter Posts',
  'social-linkedin': 'LinkedIn Posts',
  'social-facebook': 'Facebook Posts',
  'social-instagram': 'Instagram Posts',
  'email': 'Email Campaigns',
  'script': 'Video Scripts',
  'landing-page': 'Landing Pages',
  'carousel': 'Carousels',
  'meme': 'Memes',
  'google-ads': 'Google Ads'
};

export function ContentPreviewModal({
  strategy,
  open,
  onClose,
  onConfirm
}: ContentPreviewModalProps) {
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(
    new Set(strategy.contentMix.map(item => item.formatId))
  );

  const toggleFormat = (formatId: string) => {
    const newSelected = new Set(selectedFormats);
    if (newSelected.has(formatId)) {
      newSelected.delete(formatId);
    } else {
      newSelected.add(formatId);
    }
    setSelectedFormats(newSelected);
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedFormats));
    onClose();
  };

  const totalPieces = strategy.contentMix
    .filter(item => selectedFormats.has(item.formatId))
    .reduce((sum, item) => sum + item.count, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview Content Plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Review and customize the content pieces that will be generated. Uncheck items you don't want to create.
          </p>

          <div className="space-y-3">
            {strategy.contentMix.map((item) => (
              <div
                key={item.formatId}
                className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <Checkbox
                  checked={selectedFormats.has(item.formatId)}
                  onCheckedChange={() => toggleFormat(item.formatId)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-foreground">
                      {formatLabels[item.formatId] || item.formatId}
                    </span>
                    <Badge variant="outline">{item.count} pieces</Badge>
                    {/* Visual formats get image indicator */}
                    {['carousel', 'social-instagram', 'meme'].includes(item.formatId) && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <ImageIcon className="h-3 w-3" />
                        With Images
                      </Badge>
                    )}
                    {/* Video formats get video indicator */}
                    {['script'].includes(item.formatId) && (
                      <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
                        <Film className="h-3 w-3" />
                        Video Soon
                      </Badge>
                    )}
                  </div>
                  {item.frequency && (
                    <p className="text-xs text-muted-foreground">
                      📅 Publishing: {item.frequency}
                    </p>
                  )}
                  {item.bestTimes && item.bestTimes.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      ⏰ Best times: {item.bestTimes.join(', ')}
                    </p>
                  )}
                  {strategy.distributionStrategy?.channels && (
                    <p className="text-xs text-muted-foreground mt-1">
                      📢 Channels: {strategy.distributionStrategy.channels.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Media Generation Notice */}
          <div className="pt-4 border-t border-border">
            <VideoPlaceholder 
              compact 
              title="Video Generation"
              description="Video content generation coming soon"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <p className="text-sm font-medium text-foreground">
                Total Selected: {totalPieces} content pieces
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Estimated effort: {strategy.totalEffort?.hours || 'N/A'} hours
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={totalPieces === 0}>
            Generate {totalPieces} Pieces
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
