
import React from 'react';
import { Loader2, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface SerpLoadingStateProps {
  isLoading?: boolean; // Made optional so we can use it with or without this prop
  navigateToStep: (step: number) => void;
}

export const SerpLoadingState: React.FC<SerpLoadingStateProps> = ({ 
  isLoading = false, // Default value if not provided
  navigateToStep 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 text-center space-y-8"
    >
      {isLoading ? (
        <>
          <motion.div 
            className="relative"
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0, -5, 0] }} 
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-600/30 to-blue-600/30 backdrop-blur-md flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-t-primary border-l-transparent border-r-transparent border-b-transparent animate-spin"></div>
              <Search className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary animate-ping"></div>
          </motion.div>
          
          <div className="max-w-md">
            <motion.h3 
              className="text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Analyzing Search Results
            </motion.h3>
            <p className="text-muted-foreground">
              We're processing search data to provide you with the most relevant keywords, questions, and content ideas.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="space-x-1 flex items-center">
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce"></span>
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <motion.div 
            className="rounded-full bg-gradient-to-br from-purple-700/20 to-blue-700/20 p-6 border border-white/10 backdrop-blur-md"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Search className="h-12 w-12 text-muted-foreground" />
          </motion.div>
          
          <div className="max-w-md">
            <motion.h3 
              className="text-2xl font-semibold mb-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              No Analysis Results
            </motion.h3>
            <motion.p 
              className="text-muted-foreground mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Enter a keyword in the previous step to analyze search results and get content insights.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                onClick={() => navigateToStep(0)} 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white gap-2"
              >
                Go to Keyword Selection
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
};
