
import React from 'react';
import { motion } from 'framer-motion';
import { Search, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SerpFeature } from './SerpFeature';
import { toast } from 'sonner';
import { SerpAnalysisResult } from '@/services/serpApiService';

interface SerpKeywordsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent: (content: string, type: string) => void;
}

export function SerpKeywordsSection({
  serpData,
  expanded,
  onAddToContent
}: SerpKeywordsSectionProps) {
  if (!expanded || !serpData.relatedSearches || serpData.relatedSearches.length === 0) return null;

  return (
    <SerpFeature 
      title="Related Searches" 
      icon={<Search className="h-4 w-4 text-blue-400" />}
      variant="blue"
      onAddToContent={() => {
        const relatedSearchesText = serpData.relatedSearches?.map(item => `- ${item.query}${item.volume ? ` (${item.volume} searches/month)` : ''}`).join('\n') || '';
        onAddToContent(`## Related Searches\n${relatedSearchesText}\n\n`, 'relatedSearches');
        toast.success('Added all related searches');
      }}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 mb-4">
          {serpData.relatedSearches.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Badge 
                className="bg-gradient-to-r from-blue-800/40 to-purple-800/40 border border-white/10 flex items-center gap-2 cursor-pointer hover:from-blue-800/60 hover:to-purple-800/60 transition-colors"
                onClick={() => {
                  onAddToContent(item.query, 'relatedKeyword');
                  toast.success(`Added "${item.query}" to your content`);
                }}
              >
                {item.query}
                {item.volume && (
                  <span className="text-xs bg-white/10 px-1 rounded-sm">{item.volume}</span>
                )}
              </Badge>
            </motion.div>
          ))}
        </div>
        
        <div className="pt-3 border-t border-white/10">
          <h5 className="text-sm font-medium mb-2">Related Topics Strategy</h5>
          <p className="text-sm text-muted-foreground mb-3">
            Consider including these related searches in your content or creating separate pieces 
            of content targeting these keywords for a comprehensive content strategy.
          </p>
          <Button 
            className="w-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-white/10"
            variant="outline"
            onClick={() => {
              const relatedContent = serpData.relatedSearches
                ?.slice(0, 3)
                .map(item => `- **${item.query}**: Consider covering this topic in your content.\n`)
                .join('');
              
              onAddToContent(`## Related Topics to Cover\n\n${relatedContent}\n`, 'relatedTopics');
              toast.success('Added related topics section');
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Related Topics Section
          </Button>
        </div>
      </div>
    </SerpFeature>
  );
}
