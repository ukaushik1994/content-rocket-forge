
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';
import { motion } from 'framer-motion';

interface SerpContentGapsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export const SerpContentGapsSection: React.FC<SerpContentGapsSectionProps> = ({ 
  serpData, 
  expanded, 
  onAddToContent = () => {} 
}) => {
  if (!expanded || !serpData?.contentGaps?.length) return null;

  // Group content gaps by region/country if they have a country prefix
  const gapsByRegion = serpData.contentGaps.reduce((acc: Record<string, Array<{
    topic: string;
    description: string;
    recommendation?: string;
    content?: string;
    opportunity?: string;
    source?: string;
  }>>, gap) => {
    // Check if topic starts with a country code pattern (e.g., "us:", "uk:", etc.)
    const match = gap.topic.match(/^([a-z]{2}):\s*(.*)/i);
    
    if (match) {
      const [, country, actualTopic] = match;
      const regionKey = country.toLowerCase();
      
      if (!acc[regionKey]) {
        acc[regionKey] = [];
      }
      
      // Add the gap with the prefix removed
      acc[regionKey].push({
        ...gap,
        topic: actualTopic.trim()
      });
    } else {
      // If no country prefix, put in "global" category
      if (!acc.global) {
        acc.global = [];
      }
      acc.global.push(gap);
    }
    
    return acc;
  }, {});

  const hasMultipleRegions = Object.keys(gapsByRegion).length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* If we have grouped gaps by region, display them in separate sections */}
      {hasMultipleRegions ? (
        Object.entries(gapsByRegion).map(([region, gaps]) => (
          <div key={region} className="space-y-4">
            <h4 className="text-xs font-medium capitalize mb-1">
              {region === 'global' ? 'Global Content Gaps' : `${region.toUpperCase()} Content Gaps`}
            </h4>
            
            <div className="grid grid-cols-1 gap-4">
              {gaps.map((gap, index) => (
                <div key={`${region}-${index}`} className="p-4 bg-rose-900/20 border border-rose-500/20 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-medium text-rose-300">{gap.topic}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{gap.description}</p>
                      
                      {gap.recommendation && (
                        <div className="mt-2 text-xs">
                          <span className="text-rose-400">Recommendation:</span> {gap.recommendation}
                        </div>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-auto p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50"
                      onClick={() => onAddToContent(gap.topic, 'contentGap')}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        // If no country grouping, show gaps as before
        <div className="grid grid-cols-1 gap-4">
          {serpData.contentGaps.map((gap, index) => (
            <div key={index} className="p-4 bg-rose-900/20 border border-rose-500/20 rounded-lg">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-medium text-rose-300">{gap.topic}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{gap.description}</p>
                  
                  {gap.recommendation && (
                    <div className="mt-2 text-xs">
                      <span className="text-rose-400">Recommendation:</span> {gap.recommendation}
                    </div>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-auto p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50"
                  onClick={() => onAddToContent(gap.topic, 'contentGap')}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
