
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';
import { motion } from 'framer-motion';

interface SerpHeadingsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export const SerpHeadingsSection: React.FC<SerpHeadingsSectionProps> = ({
  serpData,
  expanded,
  onAddToContent = () => {}
}) => {
  if (!expanded || !serpData?.headings?.length) return null;

  // Group headings by region/country if they have a country prefix
  const headingsByRegion = serpData.headings.reduce((acc: Record<string, Array<{
    text: string;
    level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    subtext?: string;
    type?: string;
  }>>, heading) => {
    // Check if heading text starts with a country code pattern (e.g., "us:", "uk:", etc.)
    const match = heading.text.match(/^([a-z]{2}):\s*(.*)/i);
    
    if (match) {
      const [, country, actualText] = match;
      const regionKey = country.toLowerCase();
      
      if (!acc[regionKey]) {
        acc[regionKey] = [];
      }
      
      // Add the heading with the prefix removed
      acc[regionKey].push({
        ...heading,
        text: actualText.trim()
      });
    } else {
      // If no country prefix, put in "global" category
      if (!acc.global) {
        acc.global = [];
      }
      acc.global.push(heading);
    }
    
    return acc;
  }, {});

  const hasMultipleRegions = Object.keys(headingsByRegion).length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* If we have grouped headings by region, display them in separate sections */}
      {hasMultipleRegions ? (
        Object.entries(headingsByRegion).map(([region, headings]) => (
          <div key={region} className="space-y-4">
            <h4 className="text-xs font-medium capitalize mb-1">
              {region === 'global' ? 'Global Headings' : `${region.toUpperCase()} Headings`}
            </h4>
            
            <div className="grid grid-cols-1 gap-3">
              {headings.map((heading, index) => (
                <div key={`${region}-${index}`} className="p-3 bg-teal-900/20 border border-teal-500/20 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${
                          heading.level === 'h1' ? 'text-teal-300' : 
                          heading.level === 'h2' ? 'text-teal-400' : 'text-teal-500'
                        }`}>
                          {heading.level.toUpperCase()}
                        </span>
                        <h4 className="text-sm font-medium text-teal-300">{heading.text}</h4>
                      </div>
                      
                      {heading.subtext && (
                        <p className="text-xs text-muted-foreground mt-1">{heading.subtext}</p>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-auto p-1 text-teal-400 hover:text-teal-300 hover:bg-teal-950/50"
                      onClick={() => onAddToContent(heading.text, 'heading')}
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
        // If no country grouping, show headings as before
        <div className="grid grid-cols-1 gap-3">
          {serpData.headings.map((heading, index) => (
            <div key={index} className="p-3 bg-teal-900/20 border border-teal-500/20 rounded-lg">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${
                      heading.level === 'h1' ? 'text-teal-300' : 
                      heading.level === 'h2' ? 'text-teal-400' : 'text-teal-500'
                    }`}>
                      {heading.level.toUpperCase()}
                    </span>
                    <h4 className="text-sm font-medium text-teal-300">{heading.text}</h4>
                  </div>
                  
                  {heading.subtext && (
                    <p className="text-xs text-muted-foreground mt-1">{heading.subtext}</p>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-auto p-1 text-teal-400 hover:text-teal-300 hover:bg-teal-950/50"
                  onClick={() => onAddToContent(heading.text, 'heading')}
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
