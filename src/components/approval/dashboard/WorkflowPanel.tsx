
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { AdvancedFilters, BatchOperations, AssignmentManager } from '../workflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, Users, Settings } from 'lucide-react';

interface WorkflowPanelProps {
  contentItems: ContentItemType[];
}

export const WorkflowPanel: React.FC<WorkflowPanelProps> = ({ contentItems }) => {
  const handleFiltersChange = (criteria: any) => {
    console.log('Filters changed:', criteria);
  };

  const handleBatchAction = async (action: string, data?: any) => {
    console.log('Batch action:', action, data);
  };

  const handleAssignment = async (contentId: string, assignmentData: any) => {
    console.log('Assignment:', contentId, assignmentData);
  };

  return (
    <div className="h-full">
      <Tabs defaultValue="filters" className="h-full flex flex-col">
        <TabsList className="grid grid-cols-3 mb-6 bg-gray-800/50 backdrop-blur-sm">
          <TabsTrigger value="filters" className="data-[state=active]:bg-neon-purple/20">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </TabsTrigger>
          <TabsTrigger value="batch" className="data-[state=active]:bg-neon-purple/20">
            <Users className="h-4 w-4 mr-2" />
            Batch Operations
          </TabsTrigger>
          <TabsTrigger value="assignment" className="data-[state=active]:bg-neon-purple/20">
            <Settings className="h-4 w-4 mr-2" />
            Assignment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="filters" className="flex-1">
          <AdvancedFilters
            contentItems={contentItems}
            onFiltersChange={handleFiltersChange}
          />
        </TabsContent>

        <TabsContent value="batch" className="flex-1">
          <BatchOperations
            contentItems={contentItems}
            selectedItems={[]}
            onSelectionChange={() => {}}
            onBatchAction={handleBatchAction}
          />
        </TabsContent>

        <TabsContent value="assignment" className="flex-1">
          <AssignmentManager
            contentItems={contentItems}
            onAssign={handleAssignment}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
