
import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SerpAnalysisResult } from '@/types/serp';

interface SerpKeywordsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpKeywordsSection({ serpData, expanded, onAddToContent = () => {} }: SerpKeywordsSectionProps) {
  if (!expanded || !serpData) return null;

  // Get keywords from both sources
  const keywords = [
    ...(serpData.keywords || []),
    ...(serpData.relatedSearches?.map(item => item.query) || [])
  ];

  // Remove duplicates
  const uniqueKeywords = [...new Set(keywords)];
  
  if (uniqueKeywords.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No keyword data available
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
      className="flex flex-wrap gap-2 py-4"
    >
      {uniqueKeywords.map((keyword, index) => (
        <motion.div key={`keyword-${index}`} variants={item}>
          <Button
            variant="outline"
            size="sm"
            className="bg-blue-900/20 border-blue-500/30 hover:bg-blue-900/30 hover:border-blue-500/50 group"
            onClick={() => onAddToContent(keyword, 'keyword')}
          >
            <Tag className="h-3 w-3 mr-2 text-blue-400 group-hover:text-blue-300" />
            <span className="text-sm">{keyword}</span>
            <Plus className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}
