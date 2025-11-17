import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { RepositoryContent } from './RepositoryContent';
import { CampaignContentTab } from './CampaignContentTab';
import { ContentItemType } from '@/contexts/content/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Target } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface RepositoryTabsProps {
  onOpenDetailView: (content: ContentItemType) => void;
}

export const RepositoryTabs = React.memo(({ onOpenDetailView }: RepositoryTabsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'all-content';
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <GlassCard className="p-6 mb-6">
          <TabsList className="w-full grid grid-cols-2 gap-1 bg-transparent">
            <TabsTrigger 
              value="all-content"
              className="gap-2 py-3 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200"
            >
              <FileText className="h-4 w-4" />
              <span className="font-medium">All Content</span>
            </TabsTrigger>
            <TabsTrigger 
              value="campaigns"
              className="gap-2 py-3 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200"
            >
              <Target className="h-4 w-4" />
              <span className="font-medium">Campaigns</span>
            </TabsTrigger>
          </TabsList>
        </GlassCard>

        <TabsContent value="all-content">
          <GlassCard className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <RepositoryContent onOpenDetailView={onOpenDetailView} />
            </motion.div>
          </GlassCard>
        </TabsContent>

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
    </motion.div>
  );
});

RepositoryTabs.displayName = "RepositoryTabs";