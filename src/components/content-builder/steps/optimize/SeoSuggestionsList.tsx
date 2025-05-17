
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, ArrowRightCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { SeoImprovement } from '@/contexts/content-builder/types/seo-types';

interface SeoSuggestionsListProps {
  improvements: SeoImprovement[];
  onImprovementClick: (id: string) => void;
  isAnalyzing: boolean;
}

export const SeoSuggestionsList: React.FC<SeoSuggestionsListProps> = ({
  improvements,
  onImprovementClick,
  isAnalyzing,
}) => {
  // Helper function to get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'medium':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      default:
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
    }
  };
  
  return (
    <Card className="border-white/10 shadow-lg bg-gradient-to-br from-black/20 to-purple-900/10 backdrop-blur-lg h-full">
      <CardHeader className="pb-3 border-b border-white/10">
        <CardTitle className="text-sm font-medium flex items-center">
          <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
          SEO Improvement Suggestions
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 overflow-y-auto max-h-[70vh]">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
            <p className="text-sm text-center text-muted-foreground">
              Analyzing your content and generating SEO improvement suggestions...
            </p>
          </div>
        ) : improvements.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="space-y-3"
          >
            {improvements.map((improvement) => (
              <motion.div
                key={improvement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`border rounded-lg p-3 ${improvement.applied ? 'bg-green-500/10 border-green-500/30' : 'bg-card border-white/10'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm">{improvement.type}</h3>
                  <Badge className={`${getImpactColor(improvement.impact)} text-xs`}>
                    {improvement.impact} impact
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground mb-3">
                  {improvement.recommendation}
                </p>
                
                {improvement.applied ? (
                  <div className="flex items-center text-xs text-green-500">
                    <Check className="h-3 w-3 mr-1" />
                    Applied
                  </div>
                ) : (
                  <Button
                    onClick={() => onImprovementClick(improvement.id)}
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 px-2 py-1 bg-white/5 hover:bg-purple-500/20 hover:text-purple-500 w-full"
                  >
                    <ArrowRightCircle className="h-3 w-3 mr-1.5" />
                    Apply Improvement
                  </Button>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No improvement suggestions yet.</p>
            <p className="text-xs mt-1">Run the SEO analysis first to get suggestions.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
