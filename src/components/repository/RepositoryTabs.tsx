import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, BarChart3, Sparkles } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GlassCard } from '@/components/ui/GlassCard';
import { RepositoryContent } from './RepositoryContent';
import { ContentItemType } from '@/contexts/content/types';

interface RepositoryTabsProps {
  onOpenDetailView: (content: ContentItemType) => void;
}

export const RepositoryTabs = React.memo(({ onOpenDetailView }: RepositoryTabsProps) => {
  const [activeTab, setActiveTab] = useState(() => {
    // Get initial tab from URL hash or localStorage
    const hash = window.location.hash.substring(1);
    const validTabs = ['overview', 'content', 'analytics', 'templates'];
    
    if (validTabs.includes(hash)) {
      return hash;
    }
    
    return localStorage.getItem('repository-active-tab') || 'overview';
  });

  useEffect(() => {
    // Update URL hash when tab changes
    window.location.hash = activeTab;
    localStorage.setItem('repository-active-tab', activeTab);
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <GlassCard className="p-0 overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-background/50 backdrop-blur-sm border-b border-border/50 rounded-none h-16">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-3 text-sm font-medium transition-all duration-200 data-[state=active]:bg-background/80 data-[state=active]:shadow-lg"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="content"
              className="flex items-center gap-3 text-sm font-medium transition-all duration-200 data-[state=active]:bg-background/80 data-[state=active]:shadow-lg"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">All Content</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="flex items-center gap-3 text-sm font-medium transition-all duration-200 data-[state=active]:bg-background/80 data-[state=active]:shadow-lg"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger 
              value="templates"
              className="flex items-center gap-3 text-sm font-medium transition-all duration-200 data-[state=active]:bg-background/80 data-[state=active]:shadow-lg"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="overview" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <div className="text-center py-12">
                  <LayoutDashboard className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Repository Overview</h3>
                  <p className="text-muted-foreground">
                    Content statistics, recent activity, and quick actions
                  </p>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="content" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <RepositoryContent onOpenDetailView={onOpenDetailView} />
              </motion.div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Content Analytics</h3>
                  <p className="text-muted-foreground">
                    Performance metrics, engagement data, and insights
                  </p>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="templates" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <div className="text-center py-12">
                  <Sparkles className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Content Templates</h3>
                  <p className="text-muted-foreground">
                    Quick-start templates for different content types
                  </p>
                </div>
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </GlassCard>
    </motion.div>
  );
});

RepositoryTabs.displayName = "RepositoryTabs";