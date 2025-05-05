
import React from 'react';
import { SerpSelection } from '@/contexts/content-builder/types';
import { SelectedCountsType, SelectedItemsContentProps } from './types';
import { KeywordsGroup } from './groups/KeywordsGroup';
import { QuestionsGroup } from './groups/QuestionsGroup';
import { SnippetsGroup } from './groups/SnippetsGroup';
import { EntitiesGroup } from './groups/EntitiesGroup';
import { HeadingsGroup } from './groups/HeadingsGroup';
import { ContentGapsGroup } from './groups/ContentGapsGroup';
import { TopRanksGroup } from './groups/TopRanksGroup';
import { EmptySelectionState } from './EmptySelectionState';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

export const SelectedItemsContent: React.FC<SelectedItemsContentProps> = ({
  selectedCounts,
  serpSelections,
  handleToggleSelection,
  totalSelected,
  selectedTab,
  setSelectedTab
}) => {
  const hasEmptySelections = totalSelected === 0;
  
  // Separate the items by type
  const keywordItems = serpSelections.filter(item => item.type === 'keyword');
  const questionItems = serpSelections.filter(item => item.type === 'question');
  const snippetItems = serpSelections.filter(item => item.type === 'snippet');
  const competitorItems = serpSelections.filter(item => item.type === 'competitor');
  const entityItems = serpSelections.filter(item => item.type === 'entity');
  const headingItems = serpSelections.filter(item => item.type === 'heading');
  const contentGapItems = serpSelections.filter(item => item.type === 'contentGap');
  const topRankItems = serpSelections.filter(item => item.type === 'topRank');

  // For safety, convert any content that's not a string to a string
  const safeHandleToggleSelection = (type: string, content: any) => {
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    handleToggleSelection(type, contentStr);
  };
  
  return (
    <AnimatePresence mode="wait">
      {hasEmptySelections ? (
        <EmptySelectionState key="empty" />
      ) : (
        <motion.div 
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          {/* Keywords */}
          {selectedCounts.keyword > 0 && (
            <KeywordsGroup 
              count={selectedCounts.keyword}
              items={keywordItems}
              handleToggleSelection={safeHandleToggleSelection}
            />
          )}
          
          {/* Questions */}
          {selectedCounts.question > 0 && (
            <>
              {selectedCounts.keyword > 0 && <Separator className="my-3 opacity-50" />}
              <QuestionsGroup 
                count={selectedCounts.question}
                items={questionItems}
                handleToggleSelection={safeHandleToggleSelection}
              />
            </>
          )}
          
          {/* Snippets */}
          {selectedCounts.snippet > 0 && (
            <>
              {(selectedCounts.keyword > 0 || selectedCounts.question > 0) && 
                <Separator className="my-3 opacity-50" />
              }
              <SnippetsGroup 
                count={selectedCounts.snippet}
                items={snippetItems}
                handleToggleSelection={safeHandleToggleSelection}
              />
            </>
          )}
          
          {/* Entities */}
          {selectedCounts.entity > 0 && (
            <>
              {(selectedCounts.keyword > 0 || selectedCounts.question > 0 || selectedCounts.snippet > 0) && 
                <Separator className="my-3 opacity-50" />
              }
              <EntitiesGroup 
                count={selectedCounts.entity}
                items={entityItems}
                handleToggleSelection={safeHandleToggleSelection}
              />
            </>
          )}
          
          {/* Headings */}
          {selectedCounts.heading > 0 && (
            <>
              {(selectedCounts.keyword > 0 || selectedCounts.question > 0 || 
                selectedCounts.snippet > 0 || selectedCounts.entity > 0) && 
                <Separator className="my-3 opacity-50" />
              }
              <HeadingsGroup 
                count={selectedCounts.heading}
                items={headingItems}
                handleToggleSelection={safeHandleToggleSelection}
              />
            </>
          )}
          
          {/* Content Gaps */}
          {selectedCounts.contentGap > 0 && (
            <>
              {(selectedCounts.keyword > 0 || selectedCounts.question > 0 || 
                selectedCounts.snippet > 0 || selectedCounts.entity > 0 || 
                selectedCounts.heading > 0) && 
                <Separator className="my-3 opacity-50" />
              }
              <ContentGapsGroup 
                count={selectedCounts.contentGap}
                items={contentGapItems}
                handleToggleSelection={safeHandleToggleSelection}
              />
            </>
          )}
          
          {/* Top Ranks */}
          {selectedCounts.topRank > 0 && (
            <>
              {(selectedCounts.keyword > 0 || selectedCounts.question > 0 || 
                selectedCounts.snippet > 0 || selectedCounts.entity > 0 || 
                selectedCounts.heading > 0 || selectedCounts.contentGap > 0) && 
                <Separator className="my-3 opacity-50" />
              }
              <TopRanksGroup 
                count={selectedCounts.topRank}
                items={topRankItems}
                handleToggleSelection={safeHandleToggleSelection}
                competitorCount={selectedCounts.competitor}
              />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
