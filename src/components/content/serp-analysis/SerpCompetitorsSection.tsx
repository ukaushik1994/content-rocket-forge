
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Globe, ExternalLink } from 'lucide-react';
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
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4">
        {serpData.topResults.map((result, index) => (
          <div key={index} className="p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex items-center justify-center h-5 w-5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                  {result.position}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-green-300">{result.title}</h4>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    <span className="truncate max-w-[300px]">{result.link}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-auto p-1 text-green-400 hover:text-green-300 hover:bg-green-950/50"
                  onClick={() => onAddToContent(result.title, 'topRank')}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {result.snippet && (
              <div className="mt-3 text-xs text-muted-foreground bg-white/5 p-2 rounded">
                {result.snippet}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
