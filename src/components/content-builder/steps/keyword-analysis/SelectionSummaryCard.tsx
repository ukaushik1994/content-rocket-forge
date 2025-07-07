
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SerpSelection } from '@/contexts/content-builder/types';
import { CheckCircle, Eye, ArrowRight, Settings, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface SelectionSummaryCardProps {
  serpSelections: SerpSelection[];
  onOpenSelectionManager: () => void;
  onGenerateOutline: () => void;
  isGenerating?: boolean;
}

export function SelectionSummaryCard({
  serpSelections,
  onOpenSelectionManager,
  onGenerateOutline,
  isGenerating = false
}: SelectionSummaryCardProps) {
  const selectedItems = serpSelections.filter(item => item.selected);
  const totalSelected = selectedItems.length;
  
  // Group by type for summary
  const selectedByType = selectedItems.reduce((acc, item) => {
    const type = item.type === 'peopleAlsoAsk' ? 'question' : item.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeLabels = {
    question: 'Questions',
    heading: 'Headings',
    keyword: 'Keywords',
    relatedSearch: 'Related Terms',
    contentGap: 'Content Gaps',
    entity: 'Entities',
    snippet: 'Snippets'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-4"
    >
      <Card className="relative overflow-hidden glass-card card-3d border border-white/20 bg-gradient-to-br from-primary/10 via-blue-900/10 to-purple-900/5 backdrop-blur-lg shadow-xl">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 animate-gradient-shift bg-300%" />
        
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-4 right-4 w-16 h-16 bg-primary/20 rounded-full blur-xl animate-pulse-glow" />
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-blue-500/15 rounded-full blur-lg animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>

        <CardHeader className="pb-3 relative z-10 bg-gradient-to-r from-primary/5 via-blue-500/5 to-transparent border-b border-white/10">
          <CardTitle className="text-lg flex items-center gap-3">
            <motion.div 
              className="p-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/20 neon-glow"
              whileHover={{ scale: 1.05 }}
            >
              <CheckCircle className="h-5 w-5 text-primary animate-pulse" />
            </motion.div>
            <div>
              <span className="text-holographic">Content Selection</span>
              {totalSelected > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-2 inline-flex"
                >
                  <Badge className="bg-gradient-to-r from-primary/20 to-blue-500/20 text-primary border-primary/30 backdrop-blur-sm">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {totalSelected} selected
                  </Badge>
                </motion.div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6 relative z-10">
          {totalSelected === 0 ? (
            <motion.div 
              className="text-center py-8 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto mb-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg" />
                  <Eye className="h-8 w-8 text-primary mx-auto relative z-10" />
                </div>
              </motion.div>
              <p className="text-sm text-gray-300 font-medium">
                Select items from SERP analysis to include in your content generation
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-5"
            >
              {/* Selection Summary */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-holographic flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Selected for content generation:
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedByType).map(([type, count]) => (
                    <motion.div
                      key={type}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Badge 
                        variant="outline" 
                        className="text-xs bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/30 text-primary backdrop-blur-sm"
                      >
                        {count} {typeLabels[type] || type}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Preview of selected items */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-holographic">Preview:</p>
                <div className="glass-card rounded-lg p-3 border border-white/10 bg-gradient-to-br from-white/5 to-white/10">
                  <div className="text-xs text-gray-300 space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                    {selectedItems.slice(0, 5).map((item, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-start gap-2 pb-2 border-b border-white/10 last:border-0 last:pb-0"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="leading-relaxed">{item.content}</span>
                      </motion.div>
                    ))}
                    {selectedItems.length > 5 && (
                      <div className="text-xs text-primary/70 font-medium pt-1">
                        +{selectedItems.length - 5} more items...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSelectionManager}
              className="w-full bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-300"
            >
              <Settings className="h-3 w-3 mr-2" />
              Manage Selections
            </Button>
            
            {totalSelected > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  onClick={onGenerateOutline}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary/80 hover:to-blue-500/80 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-3 w-3 mr-2" />
                      Generate Outline
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>

          {totalSelected > 0 && (
            <motion.div 
              className="text-xs text-gray-400 p-3 glass-card rounded-lg border border-white/10 bg-gradient-to-br from-primary/5 to-blue-500/5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-start gap-2">
                <Sparkles className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">
                  All selected items will be strategically integrated by AI to create your content outline and generate comprehensive, SEO-optimized content.
                </span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
