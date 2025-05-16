
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BarChart2, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface FinalReviewTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const FinalReviewTabNavigation: React.FC<FinalReviewTabNavigationProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card shadow-lg rounded-lg p-1 mb-6 border border-purple-500/20"
    >
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="w-full grid grid-cols-3 gap-1">
          <TabsTrigger value="overview" className="flex gap-2 items-center data-[state=active]:bg-gradient-to-r from-blue-500/20 to-purple-500/20">
            <FileText className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="optimize" className="flex gap-2 items-center data-[state=active]:bg-gradient-to-r from-blue-500/20 to-purple-500/20">
            <BarChart2 className="h-4 w-4" />
            <span>Optimize</span>
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex gap-2 items-center data-[state=active]:bg-gradient-to-r from-blue-500/20 to-purple-500/20">
            <Settings className="h-4 w-4" />
            <span>Technical</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </motion.div>
  );
};
