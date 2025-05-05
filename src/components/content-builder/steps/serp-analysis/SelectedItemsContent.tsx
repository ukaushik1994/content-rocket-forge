
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { SelectedItemsSidebarProps } from './types';
import { 
  KeywordsGroup, 
  QuestionsGroup, 
  SnippetsGroup,
  EntitiesGroup,
  HeadingsGroup,
  ContentGapsGroup,
  TopRanksGroup
} from './groups';
import { EmptySelectionState } from './EmptySelectionState';

interface SelectedItemsContentProps extends SelectedItemsSidebarProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

export const SelectedItemsContent: React.FC<SelectedItemsContentProps> = ({
  serpSelections,
  totalSelected,
  selectedCounts,
  handleToggleSelection,
  selectedTab,
  setSelectedTab
}) => {
  // Helper function to get items by type
  function getItemsByType(type: string): any[] {
    return serpSelections.filter(item => item.type === type);
  }
  
  if (totalSelected === 0) {
    return <EmptySelectionState />;
  }

  return (
    <motion.div
      key="content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full"
    >
      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="w-full bg-white/5 border border-white/10">
          <TabsTrigger value="all" className="flex-1 text-xs data-[state=active]:bg-white/10">
            All ({totalSelected})
          </TabsTrigger>
          {selectedCounts.keyword > 0 && (
            <TabsTrigger value="keywords" className="flex-1 text-xs data-[state=active]:bg-white/10">
              Keywords ({selectedCounts.keyword})
            </TabsTrigger>
          )}
          {selectedCounts.question > 0 && (
            <TabsTrigger value="questions" className="flex-1 text-xs data-[state=active]:bg-white/10">
              Q&A ({selectedCounts.question})
            </TabsTrigger>
          )}
        </TabsList>
      </Tabs>
      
      <div className="mt-4 space-y-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-none">
        {(selectedTab === 'all' || selectedTab === 'keywords') && 
          selectedCounts.keyword > 0 && (
          <KeywordsGroup
            count={selectedCounts.keyword}
            items={getItemsByType('keyword')}
            handleToggleSelection={handleToggleSelection}
          />
        )}
        
        {(selectedTab === 'all' || selectedTab === 'questions') && 
          selectedCounts.question > 0 && (
          <QuestionsGroup
            count={selectedCounts.question}
            items={getItemsByType('question')}
            handleToggleSelection={handleToggleSelection}
          />
        )}
        
        {selectedTab === 'all' && selectedCounts.snippet > 0 && (
          <SnippetsGroup
            count={selectedCounts.snippet}
            items={getItemsByType('snippet')}
            handleToggleSelection={handleToggleSelection}
          />
        )}

        {selectedTab === 'all' && selectedCounts.entity > 0 && (
          <EntitiesGroup
            count={selectedCounts.entity}
            items={getItemsByType('entity')}
            handleToggleSelection={handleToggleSelection}
          />
        )}

        {selectedTab === 'all' && selectedCounts.heading > 0 && (
          <HeadingsGroup
            count={selectedCounts.heading}
            items={getItemsByType('heading')}
            handleToggleSelection={handleToggleSelection}
          />
        )}

        {selectedTab === 'all' && selectedCounts.contentGap > 0 && (
          <ContentGapsGroup
            count={selectedCounts.contentGap}
            items={getItemsByType('contentGap')}
            handleToggleSelection={handleToggleSelection}
          />
        )}

        {selectedTab === 'all' && (selectedCounts.topRank > 0 || selectedCounts.competitor > 0) && (
          <TopRanksGroup
            count={selectedCounts.topRank}
            competitorCount={selectedCounts.competitor}
            items={getItemsByType('topRank')}
            handleToggleSelection={handleToggleSelection}
          />
        )}
      </div>
    </motion.div>
  );
};
