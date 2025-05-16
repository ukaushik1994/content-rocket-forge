
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SerpNoDataFoundProps {
  mainKeyword: string;
  onRetry: () => void;
}

export function SerpNoDataFound({ mainKeyword, onRetry }: SerpNoDataFoundProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
    >
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          No Data Found
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          We couldn't retrieve analysis data for <span className="font-medium text-amber-500">"{mainKeyword}"</span>. 
          This could be due to a temporary API issue or connectivity problem.
        </p>
        <Button 
          variant="outline" 
          className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
          onClick={onRetry}
        >
          Try Again
        </Button>
      </div>
    </motion.div>
  );
}
