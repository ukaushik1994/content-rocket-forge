
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ListPlus, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SelectedItemsSidebarProps } from './types';
import { SelectedItemsContent } from './SelectedItemsContent';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { checkReuse } from '@/services/reusePreventionService';

export function SelectedItemsSidebar({
  serpSelections,
  totalSelected,
  selectedCounts,
  handleToggleSelection
}: SelectedItemsSidebarProps) {
  const [selectedTab, setSelectedTab] = useState('all');
  const { state } = useContentBuilder();
  const [reuseLines, setReuseLines] = useState<string[] | null>(null);

  useEffect(() => {
    // Build arrays from selected SERP items
    const selectedFaqs = serpSelections
      .filter(s => s.selected && (s.type === 'question' || s.type === 'peopleAlsoAsk'))
      .map(s => s.content);
    const selectedHeadings = serpSelections
      .filter(s => s.selected && s.type === 'heading')
      .map(s => s.content);
    const selectedTitles = [state.contentTitle || state.metaTitle].filter(Boolean) as string[];

    if (!state.mainKeyword || (selectedFaqs.length + selectedHeadings.length + selectedTitles.length) === 0) {
      setReuseLines(null);
      return;
    }

    let isActive = true;
    (async () => {
      const result = await checkReuse(state.mainKeyword, selectedFaqs, selectedHeadings, selectedTitles);
      if (!isActive || !result || !result.reused) {
        setReuseLines(null);
        return;
      }

      // Build up to 5 concise lines
      const lines: string[] = [];
      for (const h of result.matched.headings) {
        if (lines.length >= 5) break; lines.push(`• Used Heading: "${h}"`);
      }
      for (const f of result.matched.faqs) {
        if (lines.length >= 5) break; lines.push(`• Used FAQ: "${f}"`);
      }
      for (const t of result.matched.titles) {
        if (lines.length >= 5) break; lines.push(`• Used Title: "${t}"`);
      }
      setReuseLines(lines.slice(0, 5));
    })();

    return () => { isActive = false; };
  }, [serpSelections, totalSelected, state.mainKeyword, state.contentTitle, state.metaTitle]);
  
  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/10 border border-white/10 backdrop-blur-lg shadow-xl sticky top-4 h-[calc(100vh-100px)] flex flex-col">
      <CardHeader className="pb-2 border-b border-white/10 bg-gradient-to-r from-blue-900/30 to-purple-900/20 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full">
              <ListPlus className="h-3.5 w-3.5 text-white" />
            </div>
            Selected Items
            {totalSelected > 0 && (
              <Badge variant="secondary" className="bg-white/10 text-xs">
                {totalSelected}
              </Badge>
            )}
          </CardTitle>
          
          {totalSelected > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-center gap-1 text-xs text-emerald-400 font-medium"
            >
              <CheckCircle className="h-3.5 w-3.5" /> Ready
            </motion.div>
          )}
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1 overflow-y-auto">
        <CardContent className="pt-4 pb-6 px-4">
          <AnimatePresence mode="wait">
            <SelectedItemsContent
              serpSelections={serpSelections}
              totalSelected={totalSelected}
              selectedCounts={selectedCounts}
              handleToggleSelection={handleToggleSelection}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />
          </AnimatePresence>

          {reuseLines && reuseLines.length > 0 && (
            <div className="mt-3 border border-amber-500/30 rounded-md p-2 bg-amber-500/10">
              <div className="text-xs font-medium">⚠️ Previously Used Items</div>
              <ul className="mt-1 text-xs text-muted-foreground space-y-1">
                {reuseLines.map((line, idx) => (
                  <li key={idx} className="truncate">{line}</li>
                ))}
              </ul>
            </div>
          )}

        </CardContent>
      </ScrollArea>
    </Card>
  );
}
