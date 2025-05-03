
import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Search, FileText } from 'lucide-react';
import { SelectedItemsBadge } from './SelectedItemsBadge';
import { SerpSelection } from '@/contexts/content-builder/types';

interface SelectedItemsGroupProps {
  title: string;
  count: number;
  items: SerpSelection[];
  icon: React.ReactNode;
  badgeClassName: string;
  handleToggleSelection: (type: string, content: string) => void;
}

export const SelectedItemsGroup: React.FC<SelectedItemsGroupProps> = ({
  title,
  count,
  items,
  icon,
  badgeClassName,
  handleToggleSelection
}) => {
  const item = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (count === 0) return null;

  return (
    <motion.div variants={item}>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        {icon}
        <span>{title} ({count})</span>
      </h4>
      <div className="flex flex-wrap gap-2">
        {items.filter(item => item.selected).map((item, i) => (
          <SelectedItemsBadge 
            key={i}
            item={item}
            handleToggleSelection={handleToggleSelection}
            badgeClassName={badgeClassName}
          />
        ))}
      </div>
    </motion.div>
  );
};

// Pre-configured components for specific item types
export const QuestionsGroup: React.FC<{
  count: number;
  items: SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
}> = ({ count, items, handleToggleSelection }) => (
  <SelectedItemsGroup
    title="Questions"
    count={count}
    items={items}
    icon={<HelpCircle className="h-3.5 w-3.5 text-purple-400" />}
    badgeClassName="bg-purple-900/20 border-purple-500/30 text-purple-200 hover:bg-purple-900/30"
    handleToggleSelection={handleToggleSelection}
  />
);

export const KeywordsGroup: React.FC<{
  count: number;
  items: SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
}> = ({ count, items, handleToggleSelection }) => (
  <SelectedItemsGroup
    title="Keywords"
    count={count}
    items={items}
    icon={<Search className="h-3.5 w-3.5 text-blue-400" />}
    badgeClassName="bg-blue-900/20 border-blue-500/30 text-blue-200 hover:bg-blue-900/30"
    handleToggleSelection={handleToggleSelection}
  />
);

export const SnippetsGroup: React.FC<{
  count: number;
  items: SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
}> = ({ count, items, handleToggleSelection }) => (
  <SelectedItemsGroup
    title="Snippets"
    count={count}
    items={items}
    icon={<FileText className="h-3.5 w-3.5 text-green-400" />}
    badgeClassName="bg-green-900/20 border-green-500/30 text-green-200 hover:bg-green-900/30"
    handleToggleSelection={handleToggleSelection}
  />
);
