
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SerpAnalysisResult } from '@/types/serp';
import { SerpSelection } from '@/contexts/content-builder/types';
import { MetricsTab } from './tabs/MetricsTab';
import { QuestionsTab } from './tabs/QuestionsTab';
import { HeadingsTab } from './tabs/HeadingsTab';
import { ContentGapsTab } from './tabs/ContentGapsTab';
import { KeywordsTab } from './tabs/KeywordsTab';
import { TrendingUp, HelpCircle, Heading, Star, Tag, CheckCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SerpAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  serpData: SerpAnalysisResult | null;
  serpSelections: SerpSelection[];
  onToggleSelection: (type: string, content: string) => void;
  keyword: string;
}

export function SerpAnalysisModal({
  isOpen,
  onClose,
  serpData,
  serpSelections,
  onToggleSelection,
  keyword
}: SerpAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState('metrics');
  
  if (!serpData) {
    return null;
  }

  const selectedCount = serpSelections.filter(item => item.selected).length;
  
  const tabs = [
    { id: 'metrics', label: 'Metrics', icon: TrendingUp, count: null, color: 'from-blue-500 to-cyan-500' },
    { id: 'questions', label: 'FAQ Questions', icon: HelpCircle, count: serpData.peopleAlsoAsk?.length || 0, color: 'from-purple-500 to-pink-500' },
    { id: 'headings', label: 'SERP Headings', icon: Heading, count: serpData.headings?.length || 0, color: 'from-green-500 to-emerald-500' },
    { id: 'gaps', label: 'Content Gaps', icon: Star, count: serpData.contentGaps?.length || 0, color: 'from-orange-500 to-red-500' },
    { id: 'keywords', label: 'Keywords', icon: Tag, count: serpData.keywords?.length || 0, color: 'from-indigo-500 to-purple-500' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/20 shadow-2xl">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
        </div>

        <DialogHeader className="relative z-10">
          <DialogTitle className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-lg backdrop-blur-sm border border-white/10">
                <TrendingUp className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  SERP Analysis
                </div>
                <div className="text-sm text-gray-400 font-mono">{keyword}</div>
              </div>
            </motion.div>
            <AnimatePresence>
              {selectedCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30 px-3 py-1 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-mono">{selectedCount}</span>
                    <span>selected</span>
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden relative z-10">
          <TabsList className="grid w-full grid-cols-5 bg-black/20 backdrop-blur-sm border border-white/10 p-1 rounded-xl">
            {tabs.map((tab, index) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="relative flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-white/10 data-[state=active]:to-white/5 data-[state=active]:border-white/20 transition-all duration-300 rounded-lg group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <div className={`p-1 rounded bg-gradient-to-r ${tab.color} bg-opacity-20`}>
                    <tab.icon className="h-3 w-3 text-white" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{tab.label}</span>
                  {tab.count !== null && tab.count > 0 && (
                    <Badge variant="outline" className="ml-1 text-xs bg-white/10 border-white/20 text-white font-mono">
                      {tab.count}
                    </Badge>
                  )}
                </motion.div>
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg -z-10"
                    layoutId="activeTabBackground"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1 mt-6 h-[60vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="metrics" className="mt-0">
                  <MetricsTab serpData={serpData} />
                </TabsContent>
                
                <TabsContent value="questions" className="mt-0">
                  <QuestionsTab 
                    questions={serpData.peopleAlsoAsk || []}
                    serpSelections={serpSelections}
                    onToggleSelection={onToggleSelection}
                  />
                </TabsContent>
                
                <TabsContent value="headings" className="mt-0">
                  <HeadingsTab 
                    headings={serpData.headings || []}
                    serpSelections={serpSelections}
                    onToggleSelection={onToggleSelection}
                  />
                </TabsContent>
                
                <TabsContent value="gaps" className="mt-0">
                  <ContentGapsTab 
                    contentGaps={serpData.contentGaps || []}
                    serpSelections={serpSelections}
                    onToggleSelection={onToggleSelection}
                  />
                </TabsContent>
                
                <TabsContent value="keywords" className="mt-0">
                  <KeywordsTab 
                    keywords={serpData.keywords || []}
                    relatedSearches={serpData.relatedSearches || []}
                    serpSelections={serpSelections}
                    onToggleSelection={onToggleSelection}
                  />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </ScrollArea>
        </Tabs>
        
        <motion.div 
          className="flex justify-between items-center pt-4 border-t border-white/10 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-mono">{selectedCount}</span>
            <span>items selected for content generation</span>
          </div>
          <Button 
            onClick={onClose}
            className="bg-gradient-to-r from-primary/20 to-blue-500/20 hover:from-primary/30 hover:to-blue-500/30 border border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
          >
            Done
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
