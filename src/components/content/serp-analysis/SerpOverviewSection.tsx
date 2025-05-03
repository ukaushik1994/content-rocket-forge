
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, FileText, Search, TrendingUp, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SerpFeature } from './SerpFeature';
import { toast } from 'sonner';
import { SerpAnalysisResult } from '@/services/serpApiService';

interface SerpOverviewSectionProps {
  serpData: SerpAnalysisResult;
  mainKeyword: string;
  expanded: boolean;
  onAddToContent: (content: string, type: string) => void;
}

export function SerpOverviewSection({
  serpData,
  mainKeyword,
  expanded,
  onAddToContent
}: SerpOverviewSectionProps) {
  if (!expanded) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SerpFeature 
          title="Strategy Recommendations" 
          icon={<FileText className="h-4 w-4 text-purple-400" />}
          variant="purple"
          onAddToContent={() => {
            const recommendationsText = serpData.recommendations?.join('\n- ') || '';
            onAddToContent(`## Content Strategy\n- ${recommendationsText}\n\n`, 'contentStrategy');
            toast.success('Added content strategy recommendations');
          }}
        >
          <div className="space-y-3">
            {serpData.recommendations?.map((recommendation, index) => (
              <motion.div 
                key={index} 
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-sm">{recommendation}</p>
              </motion.div>
            ))}
          </div>
        </SerpFeature>
        
        <SerpFeature 
          title="Top Keywords" 
          icon={<Search className="h-4 w-4 text-blue-400" />}
          variant="blue"
          onAddToContent={() => {
            const keywordsText = serpData.keywords?.join('\n- ') || '';
            onAddToContent(`## Top Keywords\n- ${keywordsText}\n\n`, 'topKeywords');
            toast.success('Added top keywords to your content');
          }}
        >
          <div className="flex flex-wrap gap-2">
            {serpData.keywords?.map((keyword, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Badge 
                  className="bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 cursor-pointer border border-blue-500/20"
                  onClick={() => {
                    onAddToContent(keyword, 'keyword');
                    toast.success(`Added "${keyword}" keyword`);
                  }}
                >
                  {keyword}
                </Badge>
              </motion.div>
            ))}
          </div>
        </SerpFeature>
      
        <SerpFeature 
          title="Common Structure" 
          icon={<List className="h-4 w-4 text-green-400" />}
          variant="green"
          onAddToContent={() => {
            const structureText = `
## Recommended Content Structure
- H1: Use numbers (e.g., "10 Best ${mainKeyword} in 2025")
- Include definitions in the intro
- Use H2 for main categories
- Include a comparison table
- End with FAQ section
            `;
            onAddToContent(structureText, 'contentStructure');
            toast.success('Added content structure recommendations');
          }}
        >
          <ul className="space-y-2">
            <motion.li 
              className="flex items-start gap-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-sm">H1: Use numbers (e.g., "10 Best {mainKeyword} in 2025")</span>
            </motion.li>
            <motion.li 
              className="flex items-start gap-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-sm">Include definitions in the intro</span>
            </motion.li>
            <motion.li 
              className="flex items-start gap-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-sm">Use H2 for main categories</span>
            </motion.li>
            <motion.li 
              className="flex items-start gap-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-sm">Include a comparison table</span>
            </motion.li>
            <motion.li 
              className="flex items-start gap-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-sm">End with FAQ section</span>
            </motion.li>
          </ul>
        </SerpFeature>
        
        <SerpFeature 
          title="Content Gap Analysis" 
          icon={<TrendingUp className="h-4 w-4 text-purple-400" />}
          variant="purple"
          onAddToContent={() => {
            const gapAnalysisText = serpData.relatedSearches?.slice(0, 3).map(item => 
              `### ${item.query}\nThis topic is missing from top-ranking content but has search demand.\n\n`
            ).join('') || '';
            
            onAddToContent(`## Content Gap Analysis\n\n${gapAnalysisText}`, 'contentGap');
            toast.success('Added content gap analysis');
          }}
        >
          <p className="text-sm mb-3">
            These topics are missing from top-ranking content but have search demand:
          </p>
          <div className="space-y-2">
            {serpData.relatedSearches?.slice(0, 3).map((item, idx) => (
              <motion.div 
                key={idx} 
                className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/5"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <span className="text-sm">{item.query}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => {
                    onAddToContent(`## ${item.query.charAt(0).toUpperCase() + item.query.slice(1)}\n\nThis section addresses the common questions about ${item.query}...\n\n`, 'contentGap');
                    toast.success(`Added section for "${item.query}"`);
                  }}
                >
                  <PlusCircle className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </motion.div>
            ))}
          </div>
        </SerpFeature>
      </div>
    </motion.div>
  );
}
