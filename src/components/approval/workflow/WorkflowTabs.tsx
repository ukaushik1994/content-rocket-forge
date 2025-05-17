
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Link, BarChart3 } from 'lucide-react';

interface WorkflowTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const WorkflowTabs: React.FC<WorkflowTabsProps> = ({ activeTab, onTabChange }) => (
  <TabsList className="grid grid-cols-3 mb-6 p-1 bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg">
    <TabsTrigger 
      value="editor"
      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
      onClick={() => onTabChange('editor')}
    >
      <FileText className="h-4 w-4 mr-2" />
      Content Editor
    </TabsTrigger>
    <TabsTrigger 
      value="interlinking"
      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
      onClick={() => onTabChange('interlinking')}
    >
      <Link className="h-4 w-4 mr-2" />
      Interlinking
    </TabsTrigger>
    <TabsTrigger 
      value="seo"
      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
      onClick={() => onTabChange('seo')}
    >
      <BarChart3 className="h-4 w-4 mr-2" />
      SEO Analysis
    </TabsTrigger>
  </TabsList>
);
