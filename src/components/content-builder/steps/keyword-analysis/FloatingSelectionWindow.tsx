import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown, Settings, X, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SelectedKeywords } from '../../keyword/SelectedKeywords';
import { SelectionSummaryCard } from './SelectionSummaryCard';
import { SerpSelection } from '@/contexts/content-builder/types/serp-types';
import { Separator } from '@/components/ui/separator';

interface FloatingSelectionWindowProps {
  selectedKeywords: string[];
  serpSelections: SerpSelection[];
  onRemoveKeyword: (keyword: string) => void;
  onOpenSelectionManager: () => void;
  onGenerateOutline: () => void;
  isGeneratingOutline: boolean;
}

export function FloatingSelectionWindow({
  selectedKeywords,
  serpSelections,
  onRemoveKeyword,
  onOpenSelectionManager,
  onGenerateOutline,
  isGeneratingOutline
}: FloatingSelectionWindowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedCount = serpSelections.filter(item => item.selected).length;

  // Only show when items are selected
  if (selectedCount === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl max-w-4xl">
          {/* Collapsed State - Compact Bar */}
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20">
                    <Settings className="h-4 w-4 text-primary" />
                  </div>
                  <Badge className="bg-primary text-primary-foreground font-medium">
                    {selectedCount} items selected
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded(true)}
                    className="border-white/20 hover:bg-white/10 gap-2"
                  >
                    <ChevronUp className="h-4 w-4" />
                    Expand
                  </Button>
                  
                  <Button
                    onClick={onGenerateOutline}
                    disabled={isGeneratingOutline}
                    size="sm"
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 gap-2"
                  >
                    Generate Outline
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Expanded State - Full Window */}
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20">
                      <Settings className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Analysis Tools</h3>
                      <p className="text-xs text-white/60">Manage your content selections</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(false)}
                      className="hover:bg-white/10 text-white/80 hover:text-white"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-80 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Keywords Section */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                      <h4 className="text-sm font-medium text-white uppercase tracking-wide">
                        Selected Keywords
                      </h4>
                    </div>
                    
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl border border-white/20 shadow-lg overflow-hidden">
                      <div className="p-1">
                        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                          <SelectedKeywords 
                            keywords={selectedKeywords} 
                            onRemoveKeyword={onRemoveKeyword} 
                          />
                        </div>
                      </div>
                    </div>
                  </motion.section>

                  {/* SERP Analysis Section */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                      <h4 className="text-sm font-medium text-white uppercase tracking-wide">
                        SERP Analysis
                      </h4>
                    </div>
                    
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl border border-white/20 shadow-lg">
                      <SelectionSummaryCard
                        serpSelections={serpSelections}
                        onOpenSelectionManager={onOpenSelectionManager}
                        onGenerateOutline={onGenerateOutline}
                        isGenerating={isGeneratingOutline}
                      />
                    </div>
                  </motion.section>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}