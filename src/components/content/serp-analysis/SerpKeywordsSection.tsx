
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';
import { motion } from 'framer-motion';

interface SerpKeywordsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export const SerpKeywordsSection: React.FC<SerpKeywordsSectionProps> = ({ 
  serpData, 
  expanded, 
  onAddToContent = () => {} 
}) => {
  if (!expanded) return null;
  
  // Combine all keyword sources and remove duplicates
  const keywords = Array.from(new Set([
    ...(serpData.keywords || []),
    ...(serpData.relatedSearches?.map(item => item.query) || [])
  ])).filter(Boolean);
  
  if (!keywords.length) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <Badge 
            key={index}
            variant="outline" 
            className="py-1.5 pl-3 pr-2 bg-blue-950/30 border-blue-500/20 hover:bg-blue-900/30 cursor-pointer group flex items-center gap-1"
            onClick={() => onAddToContent(keyword, 'keyword')}
          >
            {keyword}
            <PlusCircle className="h-3 w-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Badge>
        ))}
      </div>
    </motion.div>
  );
};
