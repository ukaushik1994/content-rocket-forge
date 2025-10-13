import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { PublishedUrlDialog } from '@/components/content-builder/steps/save/PublishedUrlDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SmartActionBarProps {
  context: {
    contentId?: string;
    approvalStatus?: string;
  };
  disabled?: boolean;
  onApprove?: () => void;
  className?: string;
}

export const SmartActionBar: React.FC<SmartActionBarProps> = ({
  context,
  disabled,
  onApprove,
}) => {
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [isApproved, setIsApproved] = useState(context.approvalStatus === 'approved');

  const handleApprove = async () => {
    await onApprove?.();
    setIsApproved(true);
  };

  const handleUrlSubmit = async (publishedUrl: string) => {
    if (!context.contentId) return;
    
    try {
      // Update content_items with published_url
      const { error } = await supabase
        .from('content_items')
        .update({ published_url: publishedUrl })
        .eq('id', context.contentId);

      if (error) throw error;

      // Trigger Google Analytics fetch
      await supabase.functions.invoke('google-analytics-fetch', {
        body: {
          contentId: context.contentId,
          publishedUrl
        }
      });

      // Trigger Search Console fetch
      await supabase.functions.invoke('search-console-fetch', {
        body: {
          contentId: context.contentId,
          publishedUrl
        }
      });

      toast.success('Published URL added! Tracking enabled.');
      setShowUrlDialog(false);
    } catch (error) {
      console.error('Error saving published URL:', error);
      throw error;
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Approve Button */}
        <Button
          onClick={handleApprove}
          disabled={!!disabled}
          aria-label="Approve and publish content"
          size="icon"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="h-4 w-4" aria-hidden="true" />
        </Button>

        {/* Add Published Link Button */}
        <Button
          onClick={() => setShowUrlDialog(true)}
          disabled={!!disabled || !isApproved}
          aria-label="Add published URL for tracking"
          size="icon"
          variant="outline"
          className="bg-blue-600/10 border-blue-600/30 text-blue-400 hover:bg-blue-600/20"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <PublishedUrlDialog
        open={showUrlDialog}
        onClose={() => setShowUrlDialog(false)}
        onSubmit={handleUrlSubmit}
        contentTitle={context.contentId || 'Content'}
      />
    </>
  );
};
