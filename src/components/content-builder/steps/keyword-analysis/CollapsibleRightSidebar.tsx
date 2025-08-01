
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SelectedKeywords } from '../../keyword/SelectedKeywords';
import { SelectionSummaryCard } from './SelectionSummaryCard';
import { SerpSelection } from '@/contexts/content-builder/types/serp-types';

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
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-24 bottom-0 w-80 bg-background/60 backdrop-blur-xl border-l border-border/50 z-40 overflow-hidden"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Analysis Tools</h3>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="sm"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden"
                >
                  <SelectedKeywords 
                    keywords={selectedKeywords} 
                    onRemoveKeyword={onRemoveKeyword} 
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden"
                >
                  <SelectionSummaryCard
                    serpSelections={serpSelections}
                    onOpenSelectionManager={onOpenSelectionManager}
                    onGenerateOutline={onGenerateOutline}
                    isGenerating={isGeneratingOutline}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
