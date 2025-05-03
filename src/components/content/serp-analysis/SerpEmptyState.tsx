
import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SerpEmptyStateProps {
  onStartAnalysis?: () => void;
}

export function SerpEmptyState({ onStartAnalysis }: SerpEmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-96 bg-gradient-to-b from-white/5 to-white/0 rounded-xl border border-white/10 backdrop-blur-md"
    >
      <Search className="h-16 w-16 text-primary/20 mb-4" />
      <h3 className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">No Analysis Data</h3>
      <p className="text-muted-foreground mt-2 mb-6 text-center max-w-md">
        Start the SERP analysis to get insights and recommendations for your content
      </p>
      {onStartAnalysis && (
        <Button 
          onClick={onStartAnalysis} 
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300"
        >
          <Search className="h-4 w-4 mr-2" />
          Start Analysis
        </Button>
      )}
    </motion.div>
  );
}
