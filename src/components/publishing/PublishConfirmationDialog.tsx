import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Globe, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PublishConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: 'wordpress' | 'wix' | null;
  onConfirm: () => void;
  onCancel: () => void;
  isPublishing: boolean;
}

export const PublishConfirmationDialog = ({
  open,
  onOpenChange,
  provider,
  onConfirm,
  onCancel,
  isPublishing
}: PublishConfirmationDialogProps) => {
  // No connection scenario
  if (!provider) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              No Website Connected
            </DialogTitle>
            <DialogDescription>
              You need to connect a website before you can publish content.
            </DialogDescription>
          </DialogHeader>
          
          <Alert>
            <AlertDescription>
              Go to Settings → Websites to connect WordPress or Wix, or add a URL to track your published content.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const providerName = provider === 'wordpress' ? 'WordPress' : 'Wix';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Publish to {providerName}?
          </DialogTitle>
          <DialogDescription>
            This will publish your content to your connected {providerName} site.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Your content will be published to {providerName} and the published URL will open automatically.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isPublishing}
          >
            No
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPublishing}
          >
            {isPublishing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Yes, Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
