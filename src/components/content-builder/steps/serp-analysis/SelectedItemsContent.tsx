
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
  
  // Filter items by their actual types used in the SERP components
  const keywordItems = [
    ...serpSelections.filter(item => item.type === 'keyword'),
    ...serpSelections.filter(item => item.type === 'relatedSearch')
  ];
  const questionItems = serpSelections.filter(item => 
    item.type === 'question' || item.type === 'peopleAlsoAsk'
  );
  const snippetItems = serpSelections.filter(item => 
    item.type === 'snippet' || item.type === 'featuredSnippet'
  );
  const entityItems = serpSelections.filter(item => item.type === 'entity');
  const headingItems = serpSelections.filter(item => item.type === 'heading');
  const contentGapItems = serpSelections.filter(item => item.type === 'contentGap');
  const topRankItems = serpSelections.filter(item => 
    item.type === 'topRank' || item.type === 'competitor'
  );

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
          className="space-y-5"
        >
          {/* Keywords - combine regular keywords and related searches */}
          {(selectedCounts.keyword > 0 || keywordItems.filter(item => item.selected).length > 0) && (
            <KeywordsGroup 
              count={keywordItems.filter(item => item.selected).length}
              items={keywordItems}
              handleToggleSelection={safeHandleToggleSelection}
            />
          )}
          
          {/* Questions - combine question and peopleAlsoAsk */}
          {(selectedCounts.question > 0 || questionItems.filter(item => item.selected).length > 0) && (
            <>
              {selectedCounts.keyword > 0 && <Separator className="my-3 opacity-30" />}
              <QuestionsGroup 
                count={questionItems.filter(item => item.selected).length}
                items={questionItems}
                handleToggleSelection={safeHandleToggleSelection}
              />
            </>
          )}
          
          {/* Snippets */}
          {(selectedCounts.snippet > 0 || snippetItems.filter(item => item.selected).length > 0) && (
            <>
              {(selectedCounts.keyword > 0 || selectedCounts.question > 0) && 
                <Separator className="my-3 opacity-30" />
              }
              <SnippetsGroup 
                count={snippetItems.filter(item => item.selected).length}
                items={snippetItems}
                handleToggleSelection={safeHandleToggleSelection}
              />
            </>
          )}
          
          {/* Entities */}
          {(selectedCounts.entity > 0 || entityItems.filter(item => item.selected).length > 0) && (
            <>
              {(selectedCounts.keyword > 0 || selectedCounts.question > 0 || selectedCounts.snippet > 0) && 
                <Separator className="my-3 opacity-30" />
              }
              <EntitiesGroup 
                count={entityItems.filter(item => item.selected).length}
                items={entityItems}
                handleToggleSelection={safeHandleToggleSelection}
              />
            </>
          )}
          
          {/* Headings */}
          {(selectedCounts.heading > 0 || headingItems.filter(item => item.selected).length > 0) && (
            <>
              {(selectedCounts.keyword > 0 || selectedCounts.question > 0 || 
                selectedCounts.snippet > 0 || selectedCounts.entity > 0) && 
                <Separator className="my-3 opacity-30" />
              }
              <HeadingsGroup 
                count={headingItems.filter(item => item.selected).length}
                items={headingItems}
                handleToggleSelection={safeHandleToggleSelection}
              />
            </>
          )}
          
          {/* Content Gaps */}
          {(selectedCounts.contentGap > 0 || contentGapItems.filter(item => item.selected).length > 0) && (
            <>
              {(selectedCounts.keyword > 0 || selectedCounts.question > 0 || 
                selectedCounts.snippet > 0 || selectedCounts.entity > 0 || 
                selectedCounts.heading > 0) && 
                <Separator className="my-3 opacity-30" />
              }
              <ContentGapsGroup 
                count={contentGapItems.filter(item => item.selected).length}
                items={contentGapItems}
                handleToggleSelection={safeHandleToggleSelection}
              />
            </>
          )}
          
          {/* Top Ranks - includes competitors */}
          {(selectedCounts.topRank > 0 || selectedCounts.competitor > 0 || 
            topRankItems.filter(item => item.selected).length > 0) && (
            <>
              {(selectedCounts.keyword > 0 || selectedCounts.question > 0 || 
                selectedCounts.snippet > 0 || selectedCounts.entity > 0 || 
                selectedCounts.heading > 0 || selectedCounts.contentGap > 0) && 
                <Separator className="my-3 opacity-30" />
              }
              <TopRanksGroup 
                count={topRankItems.filter(item => item.selected).length}
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
