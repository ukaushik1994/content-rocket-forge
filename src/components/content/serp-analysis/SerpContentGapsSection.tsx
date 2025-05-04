
import React from 'react';
import { motion } from 'framer-motion';
import { SerpAnalysisResult } from '@/services/serpApiService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileSearch } from 'lucide-react';

export interface SerpContentGapsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpContentGapsSection({ 
  serpData, 
  expanded,
  onAddToContent = () => {}
}: SerpContentGapsSectionProps) {
  if (!expanded) return null;
  
  // Use content gaps from data or fallback to empty array
  const contentGaps = serpData.contentGaps || [];
  
  if (contentGaps.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <FileSearch className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No content gaps identified for this keyword.</p>
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
      <Card className="border border-rose-500/20 shadow-lg bg-gradient-to-br from-rose-900/20 via-black/20 to-black/30 backdrop-blur-md overflow-hidden">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {contentGaps.map((gap, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-colors group"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-rose-200">{gap.topic}</h4>
                    <p className="text-sm text-muted-foreground">{gap.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-3 hover:bg-rose-500/20 shrink-0"
                    onClick={() => onAddToContent(`${gap.topic}: ${gap.description}`, 'contentGap')}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Add</span>
                  </Button>
                </div>
                {gap.recommendation && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-rose-300 font-medium mb-1">Recommendation:</p>
                    <p className="text-xs text-muted-foreground">{gap.recommendation}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end mt-2">
        <Button 
          variant="outline"
          size="sm"
          className="text-xs border-rose-500/30 hover:bg-rose-500/20"
          onClick={() => {
            const allGaps = contentGaps.map(g => `${g.topic}: ${g.description}`).join('\n\n');
            onAddToContent(allGaps, 'allContentGaps');
          }}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add all content gaps
        </Button>
      </div>
    </motion.div>
  );
}
