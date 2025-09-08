import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SerpSelection } from '@/contexts/content-builder/types';
import { Star, Plus, Check, Lightbulb, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface ContentGapsTabProps {
  contentGaps: any[];
  serpSelections: SerpSelection[];
  onToggleSelection: (type: string, content: string) => void;
}
export function ContentGapsTab({
  contentGaps,
  serpSelections,
  onToggleSelection
}: ContentGapsTabProps) {
  const isSelected = (gap: string) => {
    return serpSelections.some(item => item.type === 'contentGap' && item.content === gap && item.selected);
  };
  if (contentGaps.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-20 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-orange-500/20 rounded-full blur-xl" />
          <div className="relative p-6 bg-gradient-to-r from-rose-500/10 to-orange-500/10 rounded-full backdrop-blur-sm border border-white/10">
            <Star className="h-12 w-12 text-rose-400" />
          </div>
        </div>
        <h3 className="text-xl font-medium mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          No content gaps found
        </h3>
        <p className="text-gray-400 max-w-md">
          No content opportunities were identified in the competitive analysis
        </p>
      </motion.div>
    );
  }
  return (
    <div className="space-y-6">
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-rose-500/20 to-orange-500/20 rounded-lg backdrop-blur-sm border border-white/10">
            <Star className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Content Opportunities
            </h3>
            <p className="text-sm text-gray-400">
              Gaps in competitor content that you can capitalize on
            </p>
          </div>
        </div>
        <Badge className="bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-rose-300 border-rose-500/30 font-mono">
          {contentGaps.length} opportunities
        </Badge>
      </motion.div>

      <div className="space-y-4">
        <AnimatePresence>
          {contentGaps.map((gap, index) => {
            const gapContent = typeof gap === 'string' ? gap : gap.content || gap.topic;
            const gapDescription = typeof gap === 'object' ? gap.description : '';
            const gapRecommendation = typeof gap === 'object' ? gap.recommendation : '';
            const selected = isSelected(gapContent);
            
            return (
              <motion.div
                key={`gap-${index}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="group"
              >
                <Card className={`relative overflow-hidden transition-all duration-300 ${
                  selected 
                    ? 'bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/30 shadow-lg shadow-rose-500/10' 
                    : 'bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-white/10 hover:border-white/20'
                } backdrop-blur-xl`}>
                  
                  {/* Animated selection indicator */}
                  {selected && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-orange-500/5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  {/* Floating particles for selected items */}
                  {selected && (
                    <>
                      <div className="absolute top-3 right-3 w-1 h-1 bg-rose-400 rounded-full animate-pulse" />
                      <div className="absolute bottom-3 left-3 w-1 h-1 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                    </>
                  )}
                  
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-rose-500/20 to-orange-500/20 rounded-lg backdrop-blur-sm border border-white/20">
                            <Star className="h-4 w-4 text-rose-400" />
                          </div>
                          <Badge className="text-xs font-mono bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-rose-300 border-rose-500/30">
                            Opportunity
                          </Badge>
                          {selected && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="flex items-center gap-1"
                            >
                              <Sparkles className="h-3 w-3 text-rose-400" />
                              <span className="text-xs text-rose-400 font-medium">Selected</span>
                            </motion.div>
                          )}
                        </div>
                        
                        <h4 className="font-medium text-white leading-relaxed">
                          {gapContent}
                        </h4>
                        
                        {gapDescription && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-sm text-gray-400 bg-white/5 rounded-lg p-3 border border-white/10"
                          >
                            {gapDescription}
                          </motion.div>
                        )}

                        {gapRecommendation && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20"
                          >
                            <Lightbulb className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-300">
                              {gapRecommendation}
                            </p>
                          </motion.div>
                        )}
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant={selected ? "default" : "outline"}
                          size="sm"
                          onClick={() => onToggleSelection('contentGap', gapContent)}
                          className={`transition-all duration-300 ${
                            selected
                              ? 'bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white shadow-lg shadow-rose-500/25'
                              : 'bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30 backdrop-blur-sm'
                          }`}
                        >
                          {selected ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center gap-2"
                            >
                              <Check className="h-3 w-3" />
                              <span>Selected</span>
                            </motion.div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Plus className="h-3 w-3" />
                              <span>Select</span>
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}