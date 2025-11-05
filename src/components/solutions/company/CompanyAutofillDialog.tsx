import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Globe } from 'lucide-react';
import { CompanyInfo } from '@/contexts/content-builder/types/company-types';
import { discoverCompanyInfo } from '@/services/companyIntelService';
import { toast } from 'sonner';
import { AIAutofillOverlay } from '@/components/common/AIAutofillOverlay';

interface CompanyAutofillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: CompanyInfo, metadata: any) => void;
  userId: string;
  currentCompanyInfo?: CompanyInfo | null;
}

export const CompanyAutofillDialog: React.FC<CompanyAutofillDialogProps> = ({
  open,
  onOpenChange,
  onComplete,
  userId,
  currentCompanyInfo
}) => {
  const [companyName, setCompanyName] = useState(currentCompanyInfo?.name || '');
  const [website, setWebsite] = useState(currentCompanyInfo?.website || '');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');

  const handleDiscover = async () => {
    if (!companyName.trim() || !website.trim()) {
      toast.error('Please enter both company name and website');
      return;
    }

    // Validate URL
    try {
      new URL(website.startsWith('http') ? website : `https://${website}`);
    } catch {
      toast.error('Please enter a valid website URL');
      return;
    }

    setIsDiscovering(true);
    setProgress(10);
    setStage('Searching for company pages...');

    try {
      setProgress(30);
      setStage('Discovering About Us pages...');

      const result = await discoverCompanyInfo(
        companyName,
        website.startsWith('http') ? website : `https://${website}`,
        userId
      );

      setProgress(60);
      setStage('Extracting company information...');

      if (!result) {
        throw new Error('No company information found');
      }

      setProgress(90);
      setStage('Processing with AI...');

      // Wait a bit for effect
      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress(100);
      setStage('Complete!');

      toast.success(`Found company information from ${result.metadata.pagesAnalyzed} pages`);

      // Close the autofill dialog
      onOpenChange(false);

      // Call onComplete with extracted data
      onComplete(result.companyInfo, result.metadata);

    } catch (error: any) {
      console.error('Autofill error:', error);
      toast.error(error.message || 'Failed to discover company information');
    } finally {
      setIsDiscovering(false);
      setProgress(0);
      setStage('');
    }
  };

  return (
    <>
      <Dialog open={open && !isDiscovering} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-background to-neon-purple/5 border border-white/10">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-neon-purple" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gradient">AI Autofill Company Info</h2>
                  <p className="text-sm text-muted-foreground font-normal">
                    Extract information from your website
                  </p>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <Input
                placeholder="Acme Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-background/50 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Company Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="pl-10 bg-background/50 border-white/10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                We'll search your About Us and Company pages
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isDiscovering}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDiscover}
                disabled={isDiscovering}
                className="flex-1 bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple gap-2"
              >
                {isDiscovering ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Discovering...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Discover Info
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AIAutofillOverlay
        open={isDiscovering}
        progress={progress}
        stage={stage}
        tips={[
          'Tip: About Us pages provide the best company information.',
          'Tip: Company mission statements are usually on About pages.',
          'Tip: Team pages help identify company size and values.',
          'Tip: Clear company websites improve extraction accuracy.'
        ]}
      />
    </>
  );
};
