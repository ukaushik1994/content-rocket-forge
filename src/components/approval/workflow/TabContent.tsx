
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { ContentApprovalEditor } from '../ContentApprovalEditor';
import { InterLinkingSuggestions } from '../interlinking/InterLinkingSuggestions';
import { SeoRecommendations } from '../seo/SeoRecommendations';
import { motion, AnimatePresence } from 'framer-motion';

interface TabContentProps {
  activeTab: string;
  selectedContent: ContentItemType;
}

export const TabContent: React.FC<TabContentProps> = ({ activeTab, selectedContent }) => {
  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={tabVariants}
      >
        {activeTab === "editor" && (
          <ContentApprovalEditor content={selectedContent} />
        )}
        
        {activeTab === "interlinking" && (
          <InterLinkingSuggestions content={selectedContent} />
        )}
        
        {activeTab === "seo" && (
          <SeoRecommendations content={selectedContent} />
        )}
      </motion.div>
    </AnimatePresence>
  );
};
