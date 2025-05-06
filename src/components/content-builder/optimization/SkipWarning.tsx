
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface SkipWarningProps {
  onSkip: () => void;
  onCancel: () => void;
}

export const SkipWarning = ({ onSkip, onCancel }: SkipWarningProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <p className="text-sm">
            You haven't run the content analysis yet. For the best SEO performance, we recommend analyzing your content before moving to the next step.
          </p>
          <div className="flex gap-3">
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-white border-amber-200 hover:bg-amber-50 text-amber-700"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={onSkip}
            >
              Skip Anyway
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
