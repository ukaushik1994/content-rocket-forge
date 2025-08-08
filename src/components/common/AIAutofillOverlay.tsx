import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, FileText, Wand2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AIAutofillOverlayProps {
  open: boolean;
  progress?: number; // 0..100
  stage?: string;
  tips?: string[];
  onCancel?: () => void;
}

// Small helper to cycle tips
function useRotatingTip(tips: string[] | undefined, intervalMs = 1800) {
  const list = tips && tips.length > 0 ? tips : undefined;
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!list) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % list.length), intervalMs);
    return () => clearInterval(t);
  }, [list, intervalMs]);
  return list ? list[index] : undefined;
}

export const AIAutofillOverlay: React.FC<AIAutofillOverlayProps> = ({
  open,
  progress = 0,
  stage = 'Preparing AI extraction…',
  tips = [
    'Tip: Clear, product-focused docs improve extraction accuracy.',
    'Tip: Pricing tables and bullet lists parse best.',
    'Tip: Include customer stories to auto-fill Case Studies.',
    'Tip: Add tech stack details to enrich Technical Specs.',
    'Tip: Market size and CAGR help fill Market Data.',
  ],
  onCancel,
}) => {
  const rotatingTip = useRotatingTip(tips);

  // Map progress (0..100) to subtle label
  const label = useMemo(() => {
    if (progress >= 100) return 'Done';
    if (progress >= 85) return 'Finalizing';
    if (progress >= 65) return 'Analyzing content';
    if (progress >= 40) return 'Sending to AI';
    if (progress >= 15) return 'Extracting text';
    return 'Preparing';
  }, [progress]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md border border-border/60 bg-background/90 backdrop-blur-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-md bg-primary/30 animate-pulse" />
            <div className="relative w-10 h-10 rounded-full flex items-center justify-center bg-primary/15 border border-primary/30">
              <Wand2 className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-medium">AI Autofill in progress</h3>
            <p className="text-sm text-muted-foreground">{stage}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{label}</span>
            <span>{Math.min(100, Math.max(0, Math.round(progress)))}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-start gap-2 mt-2">
            <FileText className="h-4 w-4 text-primary mt-0.5" />
            <p className="text-sm animate-fade-in">
              {rotatingTip || 'Tip: Use well-structured docs for best results.'}
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              'mt-4 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm',
              'bg-transparent border border-border/60 hover:bg-accent transition-colors'
            )}
          >
            Cancel
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AIAutofillOverlay;
