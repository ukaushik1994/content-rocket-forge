import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const CONTENT_TYPE_CHIPS = [
  { label: 'Article', value: 'article' },
  { label: 'Blog', value: 'blog' },
  { label: 'Email', value: 'email' },
  { label: 'Social', value: 'social_post' },
  { label: 'Glossary', value: 'glossary' },
];

type SortOption = 'date' | 'title';
type StatusFilter = 'all' | 'draft' | 'published' | 'archived';

export const CategoryContent: React.FC<CategoryContentProps> = ({ category, onOpenDetailView }) => {
  const { unifiedItems, loading } = useRepositoryContent();

  // Build a map: originalContentId -> array of repurposed format codes
  const repurposedFormatsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    unifiedItems
      .filter(item => item.sourceType === 'repurposed' && item.sourceContentId)
      .forEach(item => {
        const existing = map.get(item.sourceContentId!) || [];
        if (!existing.includes(item.formatCode)) {
          existing.push(item.formatCode);
        }
        map.set(item.sourceContentId!, existing);
      });
    return map;
  }, [unifiedItems]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    let items = unifiedItems.filter(item => categoryMatchesItem(category, item));

    // Status filter
    if (statusFilter !== 'all') {
      items = items.filter(i => i.status?.toLowerCase() === statusFilter);
    }

    // Content type chip filter (only on "all" tab)
    if (category === 'all' && activeChip) {
      items = items.filter(i => i.contentType?.toLowerCase() === activeChip);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.content.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'title') {
      items = [...items].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      items = [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    return items;
  }, [unifiedItems, category, searchQuery, statusFilter, sortBy, activeChip]);

  if (loading) return <LoadingState />;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  return (
    <div className="space-y-4">
      {/* Search + Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${category === 'all' ? 'all content' : category}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/40 backdrop-blur-sm border-border/30 focus:border-primary/40"
          />
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[130px] bg-background/40 backdrop-blur-sm border-border/30 focus:border-primary/40">
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border/50 backdrop-blur-xl z-50">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[120px] bg-background/40 backdrop-blur-sm border-border/30 focus:border-primary/40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border/50 backdrop-blur-xl z-50">
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content type chips — only on "All" tab */}
      {category === 'all' && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveChip(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
              ${!activeChip
                ? 'bg-primary/15 border-primary/40 text-foreground'
                : 'bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:bg-white/[0.08] hover:border-white/[0.12]'
              }`}
          >
            All Types
          </button>
          {CONTENT_TYPE_CHIPS.map(chip => (
            <button
              key={chip.value}
              onClick={() => setActiveChip(activeChip === chip.value ? null : chip.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
                ${activeChip === chip.value
                  ? 'bg-primary/15 border-primary/40 text-foreground'
                  : 'bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:bg-white/[0.08] hover:border-white/[0.12]'
                }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

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
                  if (item.originalItem) {
                    onOpenDetailView(item.originalItem);
                  }
                }}
                onViewSource={() => {
                  if (item.sourceContentId) {
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
                repurposedFormats={repurposedFormatsMap.get(item.id)}
              />
            )
          )}
        </motion.div>
      )}
    </div>
  );
};
