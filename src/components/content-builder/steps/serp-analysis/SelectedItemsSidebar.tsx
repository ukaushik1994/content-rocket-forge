
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ListPlus, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SelectedItemsSidebarProps } from './types';
import { SelectedItemsContent } from './SelectedItemsContent';
import { ScrollArea } from '@/components/ui/scroll-area';

export function SelectedItemsSidebar({
  serpSelections,
  totalSelected,
  selectedCounts,
  handleToggleSelection
}: SelectedItemsSidebarProps) {
  const [selectedTab, setSelectedTab] = useState('all');
  
  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/10 border border-white/10 backdrop-blur-lg shadow-xl sticky top-4 max-h-[85vh] flex flex-col">
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
        <CardContent className="pt-4 pb-6 pr-2">
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
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
