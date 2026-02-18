import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRepositoryContent, RepositoryCategory, categoryMatchesItem, UnifiedContentItem } from '@/hooks/useRepositoryContent';
import { RepositoryCard } from './RepositoryCard';
import { RepurposedContentCard } from './RepurposedContentCard';
import { ContentItemType } from '@/contexts/content/types';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';

interface CategoryContentProps {
  category: RepositoryCategory;
  onOpenDetailView: (content: ContentItemType) => void;
}

export const CategoryContent: React.FC<CategoryContentProps> = ({ category, onOpenDetailView }) => {
  const { unifiedItems, loading } = useRepositoryContent();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    let items = unifiedItems.filter(item => categoryMatchesItem(category, item));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.content.toLowerCase().includes(q)
      );
    }

    return items;
  }, [unifiedItems, category, searchQuery]);

  if (loading) return <LoadingState />;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${category === 'all' ? 'all content' : category}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-background/60 backdrop-blur-sm border-border/50"
        />
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState contentType="all" status="all" searchQuery={searchQuery} />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filteredItems.map((item) =>
            item.sourceType === 'repurposed' ? (
              <RepurposedContentCard
                key={item.id}
                item={item}
                onView={() => {
                  // For repurposed content, find the original to open detail view
                  if (item.originalItem) {
                    onOpenDetailView(item.originalItem);
                  }
                }}
                onViewSource={() => {
                  if (item.sourceContentId) {
                    // Find the original content item and open it
                    const original = unifiedItems.find(
                      u => u.id === item.sourceContentId && u.sourceType === 'original'
                    );
                    if (original?.originalItem) {
                      onOpenDetailView(original.originalItem);
                    }
                  }
                }}
              />
            ) : (
              <RepositoryCard
                key={item.id}
                content={item.originalItem!}
                onView={() => onOpenDetailView(item.originalItem!)}
              />
            )
          )}
        </motion.div>
      )}
    </div>
  );
};
