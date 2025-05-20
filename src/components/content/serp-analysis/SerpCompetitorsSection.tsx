
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Globe, ExternalLink, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
        <motion.div key={`result-${index}`} variants={item}>
          <Card className="bg-green-900/10 border-green-500/20 hover:border-green-500/40 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="bg-green-900/30 rounded-full w-6 h-6 flex-shrink-0 flex items-center justify-center text-green-300 text-xs font-medium">
                  {result.position}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm line-clamp-1 group flex items-center gap-1">
                    {result.title}
                  </h4>
                  <div className="flex items-center mt-0.5 gap-2">
                    <a 
                      href={result.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground flex items-center hover:text-green-400 transition-colors"
                    >
                      <Globe className="h-3 w-3 mr-1 opacity-70" />
                      {new URL(result.link).hostname}
                      <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {result.snippet}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-green-400 hover:text-green-300 hover:bg-green-900/20"
                  onClick={() => onAddToContent(result.title, 'topRank')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span className="text-xs">Add Title</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
