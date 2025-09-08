
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SelectedKeywords } from '../../keyword/SelectedKeywords';
import { SelectionSummaryCard } from './SelectionSummaryCard';
import { SerpSelection } from '@/contexts/content-builder/types/serp-types';
import { Separator } from '@/components/ui/separator';

interface CollapsibleRightSidebarProps {
  selectedKeywords: string[];
  serpSelections: SerpSelection[];
  onRemoveKeyword: (keyword: string) => void;
  onOpenSelectionManager: () => void;
  onGenerateOutline: () => void;
  isGeneratingOutline: boolean;
}

export function CollapsibleRightSidebar({
  selectedKeywords,
  serpSelections,
  onRemoveKeyword,
  onOpenSelectionManager,
  onGenerateOutline,
  isGeneratingOutline
}: CollapsibleRightSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  const selectedCount = serpSelections.filter(item => item.selected).length;

  return (
    <>
      {/* Toggle Button */}
      <motion.div 
        className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-xl border-border/50 hover:bg-background/90 shadow-lg"
        >
          {isOpen ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-1" />
              <Settings className="h-3 w-3" />
              {selectedCount > 0 && (
                <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center">
                  {selectedCount}
                </span>
              )}
            </>
          )}
        </Button>
      </motion.div>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed right-0 top-24 bottom-0 w-80 bg-background/70 backdrop-blur-sm border-l border-border/50 z-40 transform-gpu"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-border/50 bg-background/80 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20">
                      <Settings className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Analysis Tools</h3>
                      <p className="text-xs text-muted-foreground">Manage your content selections</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-background/80"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content - Scrollable area */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-8">
                  {/* Keywords Section */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                      <h4 className="text-sm font-medium text-foreground uppercase tracking-wide">
                        Selected Keywords
                      </h4>
                    </div>
                    
                    <div className="bg-card/60 rounded-lg border border-border/50 overflow-hidden">
                      <div className="p-1">
                        <div className="bg-primary/5 rounded-lg border border-primary/20">
                          <SelectedKeywords 
                            keywords={selectedKeywords} 
                            onRemoveKeyword={onRemoveKeyword} 
                          />
                        </div>
                      </div>
                    </div>
                  </motion.section>

                  {/* Simplified Separator */}
                  <div className="flex items-center gap-4 py-2">
                    <Separator className="flex-1" />
                    <div className="w-2 h-2 rounded-full bg-primary/40" />
                    <Separator className="flex-1" />
                  </div>
                  
                  {/* SERP Analysis Section */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                      <h4 className="text-sm font-medium text-foreground uppercase tracking-wide">
                        SERP Analysis
                      </h4>
                    </div>
                    
                    {/* Simplified container */}
                    <div className="bg-card/60 rounded-lg border border-border/50">
                      <SelectionSummaryCard
                        serpSelections={serpSelections}
                        onOpenSelectionManager={onOpenSelectionManager}
                        onGenerateOutline={onGenerateOutline}
                        isGenerating={isGeneratingOutline}
                      />
                    </div>
                  </motion.section>
                </div>

                {/* Bottom Gradient Fade */}
                <div className="h-8 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
