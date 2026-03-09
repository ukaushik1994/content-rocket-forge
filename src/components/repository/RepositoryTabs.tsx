import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { CategoryContent } from './CategoryContent';
import { CampaignContentTab } from './CampaignContentTab';
import { RepositoryBulkBar } from './RepositoryBulkBar';
import { ContentItemType } from '@/contexts/content/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layers, Share2, Mail, FileText, Video, Target } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useRepositoryContent, RepositoryCategory } from '@/hooks/useRepositoryContent';

interface RepositoryTabsProps {
  onOpenDetailView: (content: ContentItemType) => void;
}

const TAB_CONFIG: { value: RepositoryCategory | 'campaigns'; label: string; icon: React.ElementType; color: string; glowColor: string }[] = [
  { value: 'all', label: 'All', icon: Layers, color: 'text-primary', glowColor: 'shadow-primary/30' },
  { value: 'socials', label: 'Socials', icon: Share2, color: 'text-pink-400', glowColor: 'shadow-pink-400/30' },
  { value: 'email', label: 'Email', icon: Mail, color: 'text-purple-400', glowColor: 'shadow-purple-400/30' },
  { value: 'blog', label: 'Blog', icon: FileText, color: 'text-blue-400', glowColor: 'shadow-blue-400/30' },
  { value: 'scripts', label: 'Scripts', icon: Video, color: 'text-red-400', glowColor: 'shadow-red-400/30' },
  { value: 'campaigns', label: 'Campaigns', icon: Target, color: 'text-green-400', glowColor: 'shadow-green-400/30' },
];

export const RepositoryTabs = React.memo(({ onOpenDetailView }: RepositoryTabsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';
  const { categoryCounts, unifiedItems } = useRepositoryContent();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(unifiedItems.filter(i => i.sourceType === 'original').map(i => i.id)));
  }, [unifiedItems]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <GlassCard className="p-3 mb-6">
          <TabsList className="w-full grid grid-cols-6 gap-2 bg-transparent h-auto">
            {TAB_CONFIG.map(({ value, label, icon: Icon, color, glowColor }) => {
              const count = value !== 'campaigns' ? categoryCounts[value as keyof typeof categoryCounts] : undefined;
              const isActive = activeTab === value;
              return (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="relative flex flex-col items-center gap-2 py-4 px-3
                    rounded-2xl border border-transparent
                    transition-all duration-300 ease-out
                    hover:bg-white/[0.06] hover:border-white/[0.10] hover:scale-[1.02]
                    data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/15 data-[state=active]:to-primary/5
                    data-[state=active]:border-primary/40
                    data-[state=active]:shadow-lg"
                >
                  {/* Active glow indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/30"
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    />
                  )}

                  {/* Icon with glow halo */}
                  <div className="relative z-10">
                    {isActive && (
                      <div className={`absolute inset-0 -m-2 rounded-full blur-lg opacity-40 ${
                        value === 'all' ? 'bg-primary' :
                        value === 'socials' ? 'bg-pink-400' :
                        value === 'email' ? 'bg-purple-400' :
                        value === 'blog' ? 'bg-blue-400' :
                        value === 'scripts' ? 'bg-red-400' :
                        'bg-green-400'
                      }`} />
                    )}
                    <Icon className={`relative h-6 w-6 transition-all duration-300 ${isActive ? 'text-foreground scale-110' : color}`} />
                  </div>

                  <span className="relative z-10 text-xs font-medium">{label}</span>

                  {count !== undefined && count > 0 ? (
                    <span className={`relative z-10 text-[10px] px-2 py-0.5 rounded-full font-medium leading-none
                      ${isActive 
                        ? 'bg-primary/20 text-primary-foreground' 
                        : 'bg-white/[0.08] text-muted-foreground'
                      }`}>
                      {count}
                    </span>
                  ) : (
                    <span className="relative z-10 h-4" aria-hidden="true" />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </GlassCard>

        {/* Category tabs */}
        {(['all', 'socials', 'email', 'blog', 'scripts'] as RepositoryCategory[]).map(cat => (
          <TabsContent key={cat} value={cat}>
            <GlassCard className="p-6">
              <CategoryContent
                category={cat}
                onOpenDetailView={onOpenDetailView}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
              />
            </GlassCard>
          </TabsContent>
        ))}

        {/* Campaigns tab */}
        <TabsContent value="campaigns">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CampaignContentTab onOpenDetailView={onOpenDetailView} />
          </motion.div>
        </TabsContent>
      </Tabs>

      <RepositoryBulkBar
        selectedIds={selectedIds}
        totalCount={unifiedItems.filter(i => i.sourceType === 'original').length}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
      />
    </motion.div>
  );
});

RepositoryTabs.displayName = "RepositoryTabs";
