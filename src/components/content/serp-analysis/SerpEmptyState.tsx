
import React from 'react';
import { motion } from 'framer-motion';
import { Search, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface SerpEmptyStateProps {
  isApiKeyMissing?: boolean;
}

export function SerpEmptyState({ isApiKeyMissing = false }: SerpEmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
    >
      <div className="flex flex-col items-center justify-center">
        {isApiKeyMissing ? (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-amber-400">
              SERP API Key Missing
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              To analyze keywords and get search insights, you need to add your SERP API key in the settings.
            </p>
            <Button asChild variant="outline" className="border-amber-500/50 text-amber-400 hover:text-amber-300 hover:bg-amber-950/20">
              <Link to="/settings">
                Go to Settings
              </Link>
            </Button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-purple/50 to-neon-blue/30 flex items-center justify-center mb-4 animate-pulse">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">
              No Results Found
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter a keyword and click "Analyze" to get search insights and content recommendations.
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}
