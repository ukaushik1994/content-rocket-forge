
import React from 'react';
import { motion } from 'framer-motion';
import { Link, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { SerpAnalysisResult } from '@/services/serpApiService';

interface SerpCompetitorsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent: (content: string, type: string) => void;
}

export function SerpCompetitorsSection({
  serpData,
  expanded,
  onAddToContent
}: SerpCompetitorsSectionProps) {
  if (!expanded) return null;

  if (!serpData.topResults || serpData.topResults.length === 0) {
    return (
      <div className="py-4 text-center bg-white/5 rounded-lg">
        <p className="text-muted-foreground">No top results data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-gradient-to-br from-blue-900/10 via-slate-900/10 to-blue-900/10 p-4 rounded-xl border border-white/10">
      {serpData.topResults.map((result, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="border border-white/10 rounded-lg bg-white/5 overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                {result.position}
              </div>
              <h4 className="font-medium text-sm line-clamp-1">{result.title}</h4>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{result.snippet}</p>
            
            <div className="flex items-center justify-between">
              <a 
                href={result.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary flex items-center gap-1 hover:underline text-xs"
              >
                <Link className="h-3 w-3" />
                {result.link.substring(0, 35)}...
              </a>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={() => {
                  onAddToContent(`### Based on [${result.title}](${result.link})\n\n${result.snippet}\n\n`, 'competitorInsight');
                  toast.success('Added competitor insight');
                }}
              >
                <PlusCircle className="h-3 w-3 mr-1" />
                Add insight
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
      
      <Button
        className="w-full mt-4 bg-gradient-to-r from-blue-600/20 to-slate-600/20 hover:from-blue-600/30 hover:to-slate-600/30 border border-white/10"
        onClick={() => {
          let competitorInsightsContent = `## Competitor Research Analysis\n\n`;
          serpData.topResults?.slice(0, 3).forEach(result => {
            competitorInsightsContent += `### ${result.title}\n${result.snippet}\n[Source](${result.link})\n\n`;
          });
          onAddToContent(competitorInsightsContent, 'competitorAnalysis');
          toast.success('Added competitor analysis section');
        }}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Complete Competitor Analysis
      </Button>
    </div>
  );
}
