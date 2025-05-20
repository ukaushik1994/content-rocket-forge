
import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SerpAnalysisResult } from '@/types/serp';

interface SerpKeywordsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpKeywordsSection({ serpData, expanded, onAddToContent = () => {} }: SerpKeywordsSectionProps) {
  if (!expanded) return null;

  // Handle missing data
  const relatedSearches = serpData.relatedSearches || [];
  const keywords = serpData.keywords || [];
  
  if (relatedSearches.length === 0 && keywords.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No keyword data available for this search
      </div>
    );
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="py-4"
    >
      {/* Related searches */}
      {relatedSearches.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Tag className="h-4 w-4 text-blue-400" />
            Related Searches
          </h4>

          <div className="flex flex-wrap gap-2">
            {relatedSearches.map((search, index) => (
              <motion.div key={`search-${index}`} variants={item}>
                <Badge
                  className="group px-2.5 py-1 bg-blue-900/30 hover:bg-blue-700/40 text-blue-200 border-blue-500/30 cursor-pointer flex items-center gap-1.5"
                  onClick={() => onAddToContent(search.query, 'keyword')}
                >
                  {search.query}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-3 w-3" />
                  </span>
                  {search.volume && (
                    <span className="text-xs opacity-70 ml-1">({search.volume})</span>
                  )}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Tag className="h-4 w-4 text-indigo-400" />
            Key Topics
          </h4>

          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <motion.div key={`keyword-${index}`} variants={item}>
                <Badge
                  className="group px-2.5 py-1 bg-indigo-900/30 hover:bg-indigo-700/40 text-indigo-100 border-indigo-500/30 cursor-pointer flex items-center gap-1.5"
                  onClick={() => onAddToContent(keyword, 'keyword')}
                >
                  {keyword}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-3 w-3" />
                  </span>
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline"
          size="sm"
          className="text-xs border-blue-500/30 hover:bg-blue-500/20"
          onClick={() => {
            // Combine all keywords and related searches
            const allKeywords = [
              ...(keywords || []), 
              ...(relatedSearches || []).map(item => item.query)
            ].join(', ');
            onAddToContent(allKeywords, 'allKeywords');
          }}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add all keywords
        </Button>
      </div>
    </motion.div>
  );
}
