
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, ExternalLink } from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';
import { motion } from 'framer-motion';

interface SerpCompetitorsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export const SerpCompetitorsSection: React.FC<SerpCompetitorsSectionProps> = ({ 
  serpData, 
  expanded, 
  onAddToContent = () => {} 
}) => {
  if (!expanded || !serpData?.topResults?.length) return null;

  // Group top results by country
  const resultsByCountry: Record<string, Array<{
    title: string;
    link: string;
    snippet: string;
    position: number;
    country?: string;
  }>> = {};

  serpData.topResults.forEach(result => {
    const country = result.country || 'global';
    if (!resultsByCountry[country]) {
      resultsByCountry[country] = [];
    }
    resultsByCountry[country].push(result);
  });

  const hasMultipleCountries = Object.keys(resultsByCountry).length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {hasMultipleCountries ? (
        // Display results grouped by country
        Object.entries(resultsByCountry).map(([country, results]) => (
          <div key={country} className="space-y-4">
            <h4 className="text-xs font-medium capitalize mb-1">
              {country === 'global' ? 'Global Top Results' : `${country.toUpperCase()} Top Results`}
            </h4>
            
            <div className="grid grid-cols-1 gap-3">
              {results.map((result, index) => (
                <div key={`${country}-${index}`} className="p-3 bg-green-900/20 border border-green-500/20 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                          #{result.position}
                        </span>
                        <h4 className="text-sm font-medium text-green-300">{result.title}</h4>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1">{result.snippet}</p>
                      
                      <div className="mt-2">
                        <a 
                          href={result.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-green-400 hover:text-green-300 inline-flex items-center gap-1"
                        >
                          {result.link.split('/')[2]}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-auto p-1 text-green-400 hover:text-green-300 hover:bg-green-950/50"
                      onClick={() => onAddToContent(`#${result.position} - ${result.title}`, 'topRank')}
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
        // If no country grouping, show results as before
        <div className="grid grid-cols-1 gap-3">
          {serpData.topResults.map((result, index) => (
            <div key={index} className="p-3 bg-green-900/20 border border-green-500/20 rounded-lg">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                      #{result.position}
                    </span>
                    <h4 className="text-sm font-medium text-green-300">{result.title}</h4>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1">{result.snippet}</p>
                  
                  <div className="mt-2">
                    <a 
                      href={result.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-green-400 hover:text-green-300 inline-flex items-center gap-1"
                    >
                      {result.link.split('/')[2]}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-auto p-1 text-green-400 hover:text-green-300 hover:bg-green-950/50"
                  onClick={() => onAddToContent(`#${result.position} - ${result.title}`, 'topRank')}
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
