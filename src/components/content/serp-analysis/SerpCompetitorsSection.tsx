
import React from 'react';
import { motion } from 'framer-motion';
import { SerpAnalysisResult } from '@/services/serpApiService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, Plus, ExternalLink } from 'lucide-react';

export interface SerpCompetitorsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpCompetitorsSection({ 
  serpData, 
  expanded,
  onAddToContent = () => {}
}: SerpCompetitorsSectionProps) {
  if (!expanded) return null;
  
  const competitors = serpData.topResults || [];
  
  if (competitors.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <Link className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No top results data available.</p>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-green-500/20 shadow-lg bg-gradient-to-br from-green-900/20 via-black/20 to-black/30 backdrop-blur-md overflow-hidden">
        <CardContent className="pt-6">
          <div className="space-y-5">
            {competitors.map((competitor, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-medium mb-2">{competitor.title}</h4>
                  <div className="flex items-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 hover:bg-green-500/20"
                      onClick={() => onAddToContent(competitor.title, 'topRank')}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      <span className="text-xs">Add</span>
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{competitor.snippet}</p>
                
                <div className="flex items-center gap-2 text-xs">
                  <div className="bg-green-900/30 text-green-400 rounded-full px-2 py-0.5">
                    Rank: #{competitor.position}
                  </div>
                  <a 
                    href={competitor.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 flex items-center gap-1 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Source
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
