
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PublishedUrlDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (url: string) => Promise<void>;
  contentTitle: string;
}

export const PublishedUrlDialog: React.FC<PublishedUrlDialogProps> = ({
  open,
  onClose,
  onSubmit,
  contentTitle
}) => {
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    if (!validateUrl(url)) {
      toast.error('Please enter a valid URL (including http:// or https://)');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(url);
      setUrl('');
      onClose();
      toast.success('Published URL added successfully! Analytics tracking enabled.');
    } catch (error) {
      console.error('Error saving published URL:', error);
      toast.error('Failed to save published URL');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    setUrl('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-blue-400" />
            Add Published URL
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Add the published URL for "{contentTitle}" to enable Google Analytics and Search Console tracking.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="published-url" className="text-white/80">
              Published URL
            </Label>
            <Input
              id="published-url"
              type="url"
              placeholder="https://yoursite.com/your-article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
            />
            <p className="text-xs text-white/50 mt-1">
              Enter the full URL where this content is published
            </p>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !url.trim()}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Add URL & Enable Tracking'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
