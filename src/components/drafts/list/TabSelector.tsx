
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TabSelectorProps {
  selectedTab: string;
  onTabChange: (value: string) => void;
  contentCount: number;
  draftsCount: number;
  publishedCount: number;
}

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'drafts', label: 'Drafts' },
  { value: 'published', label: 'Published' },
] as const;

export const TabSelector: React.FC<TabSelectorProps> = ({
  selectedTab,
  onTabChange,
  contentCount,
  draftsCount,
  publishedCount
}) => {
  const counts: Record<string, number> = {
    all: contentCount,
    drafts: draftsCount,
    published: publishedCount,
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="w-full sm:max-w-md glass-card p-1 rounded-2xl flex">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              'relative flex-1 px-4 py-2 text-sm font-medium rounded-xl transition-colors duration-200',
              selectedTab === tab.value
                ? 'text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {selectedTab === tab.value && (
              <motion.div
                layoutId="drafts-tab-indicator"
                className="absolute inset-0 bg-primary rounded-xl"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              {tab.label} ({counts[tab.value]})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
