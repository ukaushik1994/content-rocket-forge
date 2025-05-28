
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, ChevronDown, ChevronUp, Target, TrendingUp, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface SerpAnalysisDisplayProps {
  serpData: any;
  draft: any;
  isAnalyzing: boolean;
}

export const SerpAnalysisDisplay: React.FC<SerpAnalysisDisplayProps> = ({
  serpData,
  draft,
  isAnalyzing
}) => {
  const [expandedSections, setExpandedSections] = useState({
    keywords: false,
    questions: false,
    competitors: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (isAnalyzing) {
    return (
      <Card className="h-full bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <motion.div
              className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-sm text-muted-foreground">Analyzing SERP data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const savedSerpSelections = draft.metadata?.serpSelections;
  
  if (!serpData && !savedSerpSelections) {
    return (
      <Card className="h-full bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            SERP Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <Eye className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No SERP data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="h-5 w-5" />
          SERP Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full p-0">
        <ScrollArea className="h-[calc(100%-4rem)] p-6">
          <div className="space-y-4">
            {/* SERP Metrics Summary */}
            {draft.metadata?.serpMetrics && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-3 mb-6"
              >
                <div className="p-3 bg-background/50 rounded-lg border border-white/10 text-center">
                  <div className="text-lg font-bold text-blue-500">
                    {draft.metadata.serpMetrics.totalResults || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Results Found</div>
                </div>
                <div className="p-3 bg-background/50 rounded-lg border border-white/10 text-center">
                  <div className="text-lg font-bold text-blue-500">
                    {draft.metadata.serpMetrics.competitorAnalyzed || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Competitors</div>
                </div>
              </motion.div>
            )}

            {/* Selected Keywords */}
            {savedSerpSelections?.keywords && savedSerpSelections.keywords.length > 0 && (
              <Collapsible open={expandedSections.keywords} onOpenChange={() => toggleSection('keywords')}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-background/30 hover:bg-background/50">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Selected Keywords ({savedSerpSelections.keywords.length})</span>
                    </div>
                    {expandedSections.keywords ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                    <div className="grid grid-cols-1 gap-2">
                      {savedSerpSelections.keywords.map((keyword: string, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between p-2 bg-background/30 rounded border border-green-500/30"
                        >
                          <span className="text-sm font-medium">{keyword}</span>
                          <Badge variant="secondary" className="bg-green-500/30 text-green-100 text-xs">
                            SERP
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Selected Questions */}
            {savedSerpSelections?.questions && savedSerpSelections.questions.length > 0 && (
              <Collapsible open={expandedSections.questions} onOpenChange={() => toggleSection('questions')}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-background/30 hover:bg-background/50">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Selected Questions ({savedSerpSelections.questions.length})</span>
                    </div>
                    {expandedSections.questions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
                    <div className="space-y-3">
                      {savedSerpSelections.questions.map((question: string, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-3 bg-background/30 rounded border border-orange-500/30"
                        >
                          <p className="text-sm font-medium">{question}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Entities */}
            {savedSerpSelections?.entities && savedSerpSelections.entities.length > 0 && (
              <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/20">
                <h4 className="font-medium mb-3 text-cyan-700 dark:text-cyan-300">
                  Selected Entities ({savedSerpSelections.entities.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {savedSerpSelections.entities.map((entity: string, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-2 bg-background/30 rounded border border-cyan-500/30 text-center"
                    >
                      <span className="text-sm font-medium">{entity}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Gaps */}
            {savedSerpSelections?.contentGaps && savedSerpSelections.contentGaps.length > 0 && (
              <div className="bg-pink-500/10 rounded-lg p-4 border border-pink-500/20">
                <h4 className="font-medium mb-3 text-pink-700 dark:text-pink-300">
                  Content Gaps ({savedSerpSelections.contentGaps.length})
                </h4>
                <div className="space-y-2">
                  {savedSerpSelections.contentGaps.map((gap: string, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 bg-background/30 rounded border border-pink-500/30"
                    >
                      <p className="text-sm">{gap}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
