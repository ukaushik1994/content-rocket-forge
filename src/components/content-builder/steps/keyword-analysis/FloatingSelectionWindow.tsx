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
}

export function FloatingSelectionWindow({
  selectedKeywords,
  serpSelections,
  onRemoveKeyword,
  onOpenSelectionManager
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
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          rotate: [0, 0.5, 0],
        }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 w-full floating-particles flex justify-center p-4"
      >
        <div className="relative max-w-4xl w-full">
          {/* Holographic border effect */}
          <div className="absolute inset-0 holographic-border rounded-xl" />
          
          {/* Main container with enhanced glass effect */}
          <div className="relative bg-black/80 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl card-glass">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-cyan-500/5 animate-gradient-shift bg-300% rounded-xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl" />
            {/* Collapsed State - Compact Bar */}
            {!isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="relative p-2 rounded-lg bg-gradient-to-r from-primary/30 to-primary/10 border border-primary/30"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Settings className="h-4 w-4 text-primary animate-pulse" />
                      <div className="absolute inset-0 rounded-lg bg-primary/20 animate-pulse-glow" />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Badge className="bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/30 font-medium backdrop-blur-sm glow-shadow">
                        <motion.span
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {selectedCount}
                        </motion.span>
                        <span className="ml-1">items selected</span>
                      </Badge>
                    </motion.div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsExpanded(true)}
                      className="border-white/30 hover:border-primary/50 hover:bg-primary/10 gap-2 group transition-all duration-300"
                    >
                      <ChevronUp className="h-4 w-4 group-hover:animate-bounce" />
                      <span className="text-holographic">Expand</span>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Expanded State - Full Window */}
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0, scale: 0.95 }}
                animate={{ height: 'auto', opacity: 1, scale: 1 }}
                exit={{ height: 0, opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative z-10 overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 border-b border-white/10 bg-gradient-to-r from-black/70 to-black/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <motion.div 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="relative p-2 rounded-lg bg-gradient-to-r from-primary/30 to-primary/10 border border-primary/30">
                        <Settings className="h-4 w-4 text-primary animate-pulse" />
                        <div className="absolute inset-0 rounded-lg bg-primary/20 animate-pulse-glow" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-holographic">Analysis Tools</h3>
                        <p className="text-xs text-white/60">Manage your content selections</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(false)}
                        className="hover:bg-white/10 text-white/80 hover:text-white group transition-all duration-300"
                      >
                        <Minimize2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      </Button>
                    </motion.div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-80 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Keywords Section */}
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <motion.div 
                          className="h-1 w-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                          animate={{ scaleX: [1, 1.2, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                        <h4 className="text-sm font-medium text-holographic uppercase tracking-wide">
                          Selected Keywords
                        </h4>
                      </div>
                      
                      <motion.div 
                        className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl border border-white/20 shadow-lg overflow-hidden card-3d"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5 animate-gradient-shift bg-300%" />
                        <div className="relative p-1">
                          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                            <SelectedKeywords 
                              keywords={selectedKeywords} 
                              onRemoveKeyword={onRemoveKeyword} 
                            />
                          </div>
                        </div>
                      </motion.div>
                    </motion.section>

                    {/* SERP Analysis Section */}
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <motion.div 
                          className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          animate={{ scaleX: [1, 1.2, 1] }}
                          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                        />
                        <h4 className="text-sm font-medium text-holographic uppercase tracking-wide">
                          SERP Analysis
                        </h4>
                      </div>
                      
                      <motion.div 
                        className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl border border-white/20 shadow-lg card-3d"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 animate-gradient-shift bg-300%" />
                        <div className="relative">
                          <SelectionSummaryCard
                            serpSelections={serpSelections}
                            onOpenSelectionManager={onOpenSelectionManager}
                          />
                        </div>
                      </motion.div>
                    </motion.section>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}