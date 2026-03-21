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

const TAB_CONFIG: {value: RepositoryCategory | 'campaigns';label: string;icon: React.ElementType;color: string;glowColor: string;}[] = [
{ value: 'all', label: 'All', icon: Layers, color: 'text-primary', glowColor: 'shadow-primary/30' },
{ value: 'socials', label: 'Socials', icon: Share2, color: 'text-pink-400', glowColor: 'shadow-pink-400/30' },
{ value: 'email', label: 'Email', icon: Mail, color: 'text-purple-400', glowColor: 'shadow-purple-400/30' },
{ value: 'blog', label: 'Blog', icon: FileText, color: 'text-blue-400', glowColor: 'shadow-blue-400/30' },
{ value: 'scripts', label: 'Scripts', icon: Video, color: 'text-red-400', glowColor: 'shadow-red-400/30' },
{ value: 'campaigns', label: 'Campaigns', icon: Target, color: 'text-green-400', glowColor: 'shadow-green-400/30' }];


export const RepositoryTabs = React.memo(({ onOpenDetailView }: RepositoryTabsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';
  const { categoryCounts, unifiedItems } = useRepositoryContent();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(unifiedItems.filter((i) => i.sourceType === 'original').map((i) => i.id)));
  }, [unifiedItems]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}>
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        

























































        

        {/* Category tabs */}
        {(['all', 'socials', 'email', 'blog', 'scripts'] as RepositoryCategory[]).map((cat) =>
        <TabsContent key={cat} value={cat}>
            <GlassCard className="p-6">
              <CategoryContent
              category={cat}
              onOpenDetailView={onOpenDetailView}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect} />
            
            </GlassCard>
          </TabsContent>
        )}

        {/* Campaigns tab */}
        <TabsContent value="campaigns">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}>
            
            <CampaignContentTab onOpenDetailView={onOpenDetailView} />
          </motion.div>
        </TabsContent>
      </Tabs>

      <RepositoryBulkBar
        selectedIds={selectedIds}
        totalCount={unifiedItems.filter((i) => i.sourceType === 'original').length}
        onSelectAll={selectAll}
        onClearSelection={clearSelection} />
      
    </motion.div>);

});

RepositoryTabs.displayName = "RepositoryTabs";