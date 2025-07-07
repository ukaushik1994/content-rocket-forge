
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SerpSelection } from '@/contexts/content-builder/types';
import { Heading, Plus, Check, Hash, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeadingsTabProps {
  headings: any[];
  serpSelections: SerpSelection[];
  onToggleSelection: (type: string, content: string) => void;
}

export function HeadingsTab({ headings, serpSelections, onToggleSelection }: HeadingsTabProps) {
  const isSelected = (heading: string) => {
    return serpSelections.some(
      item => item.type === 'heading' && item.content === heading && item.selected
    );
  };

  if (headings.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-20 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-xl" />
          <div className="relative p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full backdrop-blur-sm border border-white/10">
            <Heading className="h-12 w-12 text-green-400" />
          </div>
        </div>
        <h3 className="text-xl font-medium mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          No headings extracted
        </h3>
        <p className="text-gray-400 max-w-md">
          No competitor headings were extracted from the search results. Try analyzing a different keyword.
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
          <div className="p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg backdrop-blur-sm border border-white/10">
            <Heading className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Competitor Headings
            </h3>
            <p className="text-sm text-gray-400">
              Select proven headings from top-ranking content
            </p>
          </div>
        </div>
        <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30 font-mono">
          {headings.length} headings
        </Badge>
      </motion.div>

      <div className="space-y-4">
        <AnimatePresence>
          {headings.map((heading, index) => {
            const headingText = typeof heading === 'string' ? heading : heading.text;
            const headingLevel = typeof heading === 'object' ? heading.level : 'h2';
            const headingSubtext = typeof heading === 'object' ? heading.subtext : '';
            const selected = isSelected(headingText);
            
            // Color scheme based on heading level
            const levelColors = {
              h1: 'from-red-500 to-pink-500',
              h2: 'from-blue-500 to-cyan-500',
              h3: 'from-green-500 to-emerald-500',
              h4: 'from-yellow-500 to-orange-500',
              h5: 'from-purple-500 to-indigo-500',
              h6: 'from-gray-500 to-slate-500'
            };
            
            const levelColor = levelColors[headingLevel as keyof typeof levelColors] || levelColors.h2;
            
            return (
              <motion.div
                key={`heading-${index}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="group"
              >
                <Card className={`relative overflow-hidden transition-all duration-300 ${
                  selected 
                    ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 shadow-lg shadow-green-500/10' 
                    : 'bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-white/10 hover:border-white/20'
                } backdrop-blur-xl`}>
                  
                  {/* Animated selection indicator */}
                  {selected && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  {/* Floating particles for selected items */}
                  {selected && (
                    <>
                      <div className="absolute top-3 right-3 w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                      <div className="absolute bottom-3 left-3 w-1 h-1 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                    </>
                  )}
                  
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg backdrop-blur-sm border transition-all duration-300 bg-gradient-to-r ${levelColor} bg-opacity-20 border-white/20`}>
                            <Hash className="h-4 w-4 text-white" />
                          </div>
                          <Badge className={`text-xs font-mono bg-gradient-to-r ${levelColor} bg-opacity-20 text-white border-white/20`}>
                            {headingLevel.toUpperCase()}
                          </Badge>
                          {selected && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="flex items-center gap-1"
                            >
                              <Sparkles className="h-3 w-3 text-green-400" />
                              <span className="text-xs text-green-400 font-medium">Selected</span>
                            </motion.div>
                          )}
                        </div>
                        
                        <h4 className="font-medium text-white leading-relaxed">
                          {headingText}
                        </h4>
                        
                        {headingSubtext && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-sm text-gray-400 bg-white/5 rounded-lg p-3 border border-white/10"
                          >
                            {headingSubtext.length > 150 ? 
                              `${headingSubtext.substring(0, 150)}...` : 
                              headingSubtext
                            }
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
                          onClick={() => onToggleSelection('heading', headingText)}
                          className={`transition-all duration-300 ${
                            selected
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25'
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
