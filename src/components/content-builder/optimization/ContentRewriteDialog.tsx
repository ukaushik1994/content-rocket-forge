
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, RefreshCw, Wand2 } from 'lucide-react';

interface ContentRewriteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRecommendation: string | null;
  rewriteType: string;
  rewrittenContent: string;
  isRewriting: boolean;
  onApplyContent: () => void;
}

export const ContentRewriteDialog = ({
  open,
  onOpenChange,
  selectedRecommendation,
  rewriteType,
  rewrittenContent,
  isRewriting,
  onApplyContent
}: ContentRewriteDialogProps) => {
  // Debug logging when content changes
  React.useEffect(() => {
    if (rewrittenContent) {
      console.log("[ContentRewriteDialog] Rewritten content available for type:", rewriteType);
    }
  }, [rewrittenContent, rewriteType]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-500" />
            <span>Content Optimization</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            {selectedRecommendation}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4 space-y-4">
          {isRewriting ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="h-10 w-10 animate-spin text-purple-500 mb-4" />
              <p className="text-center text-muted-foreground">
                Optimizing your content for better {rewriteType}...
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                  Optimized Content Preview
                </Badge>
              </div>
              
              <div className="border rounded-md p-4 bg-zinc-900/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500/20 to-blue-500/20 text-xs px-2 py-0.5">
                  Optimized for {rewriteType}
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {rewrittenContent || "No preview available"}
                </pre>
              </div>
            </>
          )}
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onApplyContent} 
            disabled={isRewriting || !rewrittenContent}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-1"
          >
            {isRewriting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            Apply Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
