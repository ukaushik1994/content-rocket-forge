
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
  
  // Combine all keyword sources and deduplicate
  const rawKeywords = [
    ...(serpData.keywords || []),
    ...(serpData.relatedSearches?.map(item => item.query) || [])
  ].filter(Boolean);
  
  // Deduplicate keywords using a Set and convert back to array
  const uniqueKeywordsSet = new Set(rawKeywords.map(kw => kw.toLowerCase()));
  const keywords = Array.from(uniqueKeywordsSet).map((lowerKw) => {
    // Find the original keyword with its original casing
    const originalKeyword = rawKeywords.find(k => k.toLowerCase() === lowerKw);
    return originalKeyword || lowerKw;
  });
  
  // Group keywords by region/country if they are prefixed with a country code
  const keywordsByRegion = keywords.reduce((acc: Record<string, string[]>, keyword) => {
    // Check if keyword starts with a country code pattern (e.g., "us:", "uk:", etc.)
    const match = keyword.match(/^([a-z]{2}):\s*(.*)/i);
    
    if (match) {
      const [, country, actualKeyword] = match;
      const regionKey = country.toLowerCase();
      
      if (!acc[regionKey]) {
        acc[regionKey] = [];
      }
      acc[regionKey].push(actualKeyword.trim());
    } else {
      // If no country prefix, put in "global" category
      if (!acc.global) {
        acc.global = [];
      }
      acc.global.push(keyword);
    }
    
    return acc;
  }, {});
  
  if (!keywords.length) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Show grouped keywords by region if we have regional data */}
      {Object.keys(keywordsByRegion).length > 1 ? (
        Object.entries(keywordsByRegion).map(([region, regionKeywords]) => (
          <div key={region} className="space-y-2">
            <h4 className="text-xs font-medium capitalize mb-1">
              {region === 'global' ? 'Global Keywords' : `${region.toUpperCase()} Keywords`}
            </h4>
            <div className="flex flex-wrap gap-2">
              {regionKeywords.map((keyword, index) => (
                <Badge 
                  key={`${region}-${index}`}
                  variant="outline" 
                  className="py-1.5 pl-3 pr-2 bg-blue-950/30 border-blue-500/20 hover:bg-blue-900/30 cursor-pointer group flex items-center gap-1"
                  onClick={() => onAddToContent(keyword, 'keyword')}
                >
                  {keyword}
                  <PlusCircle className="h-3 w-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Badge>
              ))}
            </div>
          </div>
        ))
      ) : (
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
      )}
    </motion.div>
  );
};
