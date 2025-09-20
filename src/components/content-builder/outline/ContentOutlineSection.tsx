
import React, { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { AIOutlineGenerator } from './AIOutlineGenerator';
import { OutlineTable } from './OutlineTable';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { OutlineSection } from '@/contexts/content-builder/types/outline-types';

export const ContentOutlineSection = () => {
  const { state, dispatch } = useContentBuilder();
  const { outline, serpSelections } = state;
  
  const selectedItems = serpSelections.filter(item => item.selected);
  const hasOutline = outline.length > 0;
  
  const handleSaveOutline = (updatedOutline: string[]) => {
    // Convert string[] to OutlineSection[]
    const outlineSections: OutlineSection[] = updatedOutline.map((title, index) => ({
      id: `section-${index}`,
      title,
      level: 1
    }));
    dispatch({ type: 'SET_OUTLINE', payload: outlineSections });
  };

  // Group selected items by type for compact display
  const itemsByType = {
    question: selectedItems.filter(item => 
      item.type === 'question' || item.type === 'questions' || item.type === 'peopleAlsoAsk'
    ),
    keyword: selectedItems.filter(item => 
      item.type === 'keyword' || item.type === 'keywords' || item.type === 'relatedSearch'
    ),
    snippet: selectedItems.filter(item => 
      item.type === 'snippet' || item.type === 'featuredSnippet'
    ),
    other: selectedItems.filter(item => 
      !['question', 'questions', 'peopleAlsoAsk', 'keyword', 'keywords', 'relatedSearch', 'snippet', 'featuredSnippet'].includes(item.type)
    )
  };

  const totalCounts = {
    question: itemsByType.question.length,
    keyword: itemsByType.keyword.length,
    snippet: itemsByType.snippet.length,
    other: itemsByType.other.length
  };

  return (
    <Card className="border border-white/10 bg-gradient-to-br from-indigo-950/30 to-purple-950/20 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-neon-purple to-neon-blue p-2 rounded-lg">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Content Outline</h3>
            <p className="text-sm text-muted-foreground font-normal">
              Research → Generate → Edit your content structure
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Research Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              selectedItems.length > 0 ? 'bg-green-500 text-white' : 'bg-white/10 text-white/50'
            }`}>
              1
            </div>
            <span className={selectedItems.length > 0 ? 'text-green-400' : 'text-white/70'}>
              Research Summary
            </span>
            {selectedItems.length > 0 && <CheckCircle className="h-4 w-4 text-green-400" />}
          </div>
          
          {selectedItems.length > 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs text-white/70">Selected items:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {totalCounts.question > 0 && (
                  <Badge variant="outline" className="bg-purple-900/30 border-purple-500/30 text-xs">
                    {totalCounts.question} Questions
                  </Badge>
                )}
                {totalCounts.keyword > 0 && (
                  <Badge variant="outline" className="bg-blue-900/30 border-blue-500/30 text-xs">
                    {totalCounts.keyword} Keywords
                  </Badge>
                )}
                {totalCounts.snippet > 0 && (
                  <Badge variant="outline" className="bg-amber-900/30 border-amber-500/30 text-xs">
                    {totalCounts.snippet} Snippets
                  </Badge>
                )}
                {totalCounts.other > 0 && (
                  <Badge variant="outline" className="bg-green-900/30 border-green-500/30 text-xs">
                    {totalCounts.other} Other
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                No research items selected yet. Complete your SERP analysis first.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center">
          <ArrowRight className="h-4 w-4 text-white/30" />
        </div>

        {/* Step 2: AI Generation */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              hasOutline ? 'bg-green-500 text-white' : 'bg-neon-purple text-white'
            }`}>
              2
            </div>
            <span className={hasOutline ? 'text-green-400' : 'text-white/70'}>
              AI Generation
            </span>
            {hasOutline && <CheckCircle className="h-4 w-4 text-green-400" />}
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <AIOutlineGenerator />
          </div>
        </div>

        <AnimatePresence>
          {hasOutline && (
            <>
              <motion.div 
                className="flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <ArrowRight className="h-4 w-4 text-white/30" />
              </motion.div>

              {/* Step 3: Edit Outline */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <span className="text-green-400">Edit & Finalize</span>
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                
                <motion.div 
                  className="bg-gradient-to-br from-green-950/20 to-blue-950/20 border border-green-500/20 rounded-lg overflow-hidden"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                >
                  <div className="p-4 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-blue-500/10">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-green-400">Generated Outline</span>
                      <Badge variant="outline" className="bg-green-900/30 border-green-500/30 text-xs">
                        {outline.length} sections
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <OutlineTable outline={outline} onSave={handleSaveOutline} />
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
