
import React, { useState, memo, useEffect } from 'react';
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
import { ArrowRight, RefreshCw, Wand2, Check, Copy, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ContentRewriteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRecommendation: string | null;
  rewriteType: string;
  rewrittenContent: string;
  isRewriting: boolean;
  onApplyContent: () => void;
}

// Use memo to prevent unnecessary re-renders
export const ContentRewriteDialog = memo(({
  open,
  onOpenChange,
  selectedRecommendation,
  rewriteType,
  rewrittenContent,
  isRewriting,
  onApplyContent
}: ContentRewriteDialogProps) => {
  const [showDiff, setShowDiff] = useState(false);
  const [longOperationWarning, setLongOperationWarning] = useState(false);
  
  // Timer to show warning after extended processing time
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (isRewriting) {
      setLongOperationWarning(false);
      timer = setTimeout(() => {
        setLongOperationWarning(true);
      }, 5000); // Show warning after 5 seconds
    } else {
      setLongOperationWarning(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isRewriting]);

  const copyToClipboard = () => {
    if (rewrittenContent) {
      navigator.clipboard.writeText(rewrittenContent);
      toast.success("Content copied to clipboard");
    }
  };

  const getOptimizationColor = (type: string) => {
    switch(type.toLowerCase()) {
      case 'keyword optimization': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'readability': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'structure': return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      default: return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30';
    }
  };

  const handleClose = () => {
    if (!isRewriting || longOperationWarning) {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-background/95 backdrop-blur-md border border-purple-500/20 shadow-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
            <Wand2 className="h-5 w-5 text-purple-500" />
            <span>AI Content Optimization</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="mt-1 mb-2">
              {selectedRecommendation}
            </div>
            <Badge variant="outline" className={`mt-1 ${getOptimizationColor(rewriteType)}`}>
              {rewriteType} optimization
            </Badge>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4 space-y-4">
          {isRewriting ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 animate-pulse"></div>
                <RefreshCw className="h-8 w-8 text-purple-500 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-center text-muted-foreground mt-4 max-w-md">
                AI is optimizing your content for better <span className="font-medium text-purple-500">{rewriteType}</span>...
              </p>
              
              {/* Warning for long-running operations */}
              {longOperationWarning && (
                <div className="mt-4 p-3 border border-amber-300 rounded-md bg-amber-50 max-w-sm">
                  <div className="flex items-start gap-2 text-amber-700">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Taking longer than expected</p>
                      <p className="text-xs mt-1">You can cancel and try again, or wait a bit longer.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/30">
                  Optimized Content Preview
                </Badge>
                
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 gap-1 text-xs"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 gap-1 text-xs"
                    onClick={() => setShowDiff(!showDiff)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {showDiff ? 'Simple View' : 'Show Changes'}
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md p-4 bg-black/50 relative overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500/20 to-blue-500/20 text-xs px-2 py-0.5">
                  Optimized for {rewriteType}
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm text-white/90 leading-relaxed overflow-auto max-h-[300px]">
                  {rewrittenContent || "No preview available"}
                </pre>
              </div>
            </motion.div>
          )}
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="border-purple-500/30 text-muted-foreground hover:text-foreground hover:bg-purple-500/5"
            onClick={() => onOpenChange(false)}
            disabled={isRewriting && !longOperationWarning}
          >
            {isRewriting && !longOperationWarning ? "Processing..." : "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => {
              if (!isRewriting && rewrittenContent) {
                onApplyContent();
              }
            }} 
            disabled={isRewriting || !rewrittenContent}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-1"
          >
            {isRewriting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Apply Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

// Add display name for React devtools
ContentRewriteDialog.displayName = 'ContentRewriteDialog';
