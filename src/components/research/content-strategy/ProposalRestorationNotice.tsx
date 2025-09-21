import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ProposalRestorationNoticeProps {
  isVisible: boolean;
  onComplete?: () => void;
  proposalTitle?: string;
}

export const ProposalRestorationNotice: React.FC<ProposalRestorationNoticeProps> = ({
  isVisible,
  onComplete,
  proposalTitle
}) => {
  const [stage, setStage] = useState<'restoring' | 'completed'>('restoring');

  useEffect(() => {
    if (isVisible) {
      setStage('restoring');
      
      // Show completion after 2 seconds
      const timer = setTimeout(() => {
        setStage('completed');
        
        // Auto-hide after showing completion
        const hideTimer = setTimeout(() => {
          onComplete?.();
        }, 2000);
        
        return () => clearTimeout(hideTimer);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Card className="min-w-[320px] border-primary/20 bg-card/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {stage === 'restoring' ? (
                <RefreshCw className="h-5 w-5 text-primary animate-spin mt-0.5" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {stage === 'restoring' 
                    ? 'Restoring Proposal...' 
                    : 'Proposal Restored!'
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {stage === 'restoring' 
                    ? `"${proposalTitle || 'Content proposal'}" is being restored to available status.`
                    : `"${proposalTitle || 'Content proposal'}" is now available for scheduling again.`
                  }
                </p>
              </div>
            </div>
            
            {stage === 'restoring' && (
              <div className="mt-3">
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};