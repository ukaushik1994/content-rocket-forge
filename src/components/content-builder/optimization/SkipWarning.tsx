
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SkipWarningProps {
  onSkip: () => void;
  onCancel: () => void;
}

export const SkipWarning = ({ onSkip, onCancel }: SkipWarningProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Alert variant="destructive" className="border-yellow-300 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">SEO Optimization Skipped</AlertTitle>
        <AlertDescription className="text-yellow-700 mt-1">
          Are you sure you want to skip the optimization step? This may result in lower search rankings and visibility.
        </AlertDescription>
        
        <div className="flex items-center gap-3 mt-4">
          <Button 
            onClick={onSkip} 
            variant="default" 
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Check className="h-4 w-4 mr-1" /> Skip Anyway
          </Button>
          <Button 
            onClick={onCancel} 
            variant="outline" 
            size="sm"
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
        </div>
      </Alert>
    </motion.div>
  );
};
