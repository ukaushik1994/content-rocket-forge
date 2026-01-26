import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartSuggestionsProps {
  suggestions: string[];
  onSuggestionClick?: (suggestion: string) => void;
  title?: string;
  className?: string;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
  title = "Continue the conversation",
  className
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={cn("mt-4", className)}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            onClick={() => onSuggestionClick?.(suggestion)}
            className={cn(
              "group flex items-center gap-2 px-3 py-2 rounded-lg",
              "bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40",
              "text-sm text-muted-foreground hover:text-foreground",
              "transition-all duration-200"
            )}
          >
            <span className="text-primary text-xs">✦</span>
            <span className="truncate max-w-[200px]">{suggestion}</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
