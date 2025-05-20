
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Link as LinkIcon, ExternalLink, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SerpAnalysisResult } from '@/types/serp';

interface SerpCompetitorsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpCompetitorsSection({ serpData, expanded, onAddToContent = () => {} }: SerpCompetitorsSectionProps) {
  if (!expanded || !serpData?.topResults?.length) return null;
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-3 py-4"
    >
      {serpData.topResults.map((result, index) => (
        <motion.div key={`competitor-${index}`} variants={item}>
          <div className="bg-green-900/10 border border-green-500/20 hover:border-green-500/40 rounded-md p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-green-500/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                  {result.position || index + 1}
                </div>
                <h4 className="font-medium text-sm line-clamp-1">{result.title}</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-green-400 hover:text-green-300 hover:bg-green-900/20"
                onClick={() => onAddToContent(`${result.title} - ${result.link}`, 'topRank')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {result.snippet && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {result.snippet}
              </p>
            )}
            
            {result.link && (
              <div className="flex items-center text-xs text-muted-foreground">
                <LinkIcon className="h-3 w-3 mr-1" />
                <span className="truncate">{result.link}</span>
                <a 
                  href={result.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 text-green-400 hover:text-green-300"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
