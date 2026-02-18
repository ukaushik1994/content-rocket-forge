import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { CategoryContent } from './CategoryContent';
import { CampaignContentTab } from './CampaignContentTab';
import { ContentItemType } from '@/contexts/content/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layers, Share2, Mail, FileText, Video, Target } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useRepositoryContent, RepositoryCategory } from '@/hooks/useRepositoryContent';
import { Badge } from '@/components/ui/badge';

interface RepositoryTabsProps {
  onOpenDetailView: (content: ContentItemType) => void;
}

const TAB_CONFIG: { value: RepositoryCategory | 'campaigns'; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'all', label: 'All', icon: Layers, color: 'text-primary' },
  { value: 'socials', label: 'Socials', icon: Share2, color: 'text-pink-400' },
  { value: 'email', label: 'Email', icon: Mail, color: 'text-purple-400' },
  { value: 'blog', label: 'Blog', icon: FileText, color: 'text-blue-400' },
  { value: 'scripts', label: 'Scripts', icon: Video, color: 'text-red-400' },
  { value: 'campaigns', label: 'Campaigns', icon: Target, color: 'text-green-400' },
];

export const RepositoryTabs = React.memo(({ onOpenDetailView }: RepositoryTabsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';
  const { categoryCounts } = useRepositoryContent();

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
        <GlassCard className="p-4 mb-6">
          <TabsList className="w-full grid grid-cols-6 gap-1 bg-transparent h-auto">
            {TAB_CONFIG.map(({ value, label, icon: Icon, color }) => {
              const count = value !== 'campaigns' ? categoryCounts[value as keyof typeof categoryCounts] : undefined;
              return (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex flex-col items-center gap-1.5 py-3 px-2
                    data-[state=active]:bg-primary data-[state=active]:text-primary-foreground 
                    data-[state=active]:shadow-lg transition-all duration-200 rounded-xl"
                >
                  <Icon className={`h-5 w-5 ${activeTab === value ? '' : color}`} />
                  <span className="text-xs font-medium">{label}</span>
                  {count !== undefined && count > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4 min-w-[18px] leading-none"
                    >
                      {count}
                    </Badge>
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
              <CategoryContent category={cat} onOpenDetailView={onOpenDetailView} />
            </GlassCard>
          </TabsContent>
        ))}

        {/* Campaigns tab - unchanged */}
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
