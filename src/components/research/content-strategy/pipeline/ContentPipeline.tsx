
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, Plus, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { PipelineItemDialog } from './PipelineItemDialog';
import { PipelineStageColumn } from './PipelineStageColumn';
import { PipelineAnalyticsDashboard } from './PipelineAnalyticsDashboard';
import { useProposalIntegration } from '@/hooks/useProposalIntegration';
import { useProposalRestoration } from '@/hooks/useProposalRestoration';
import { toast } from 'sonner';

interface ContentPipelineProps {
  goals: any;
}

export const ContentPipeline = ({ goals }: ContentPipelineProps) => {
  const { 
    pipelineItems, 
    calendarItems,
    createPipelineItem, 
    updatePipelineItem, 
    deletePipelineItem, 
    loading,
    refreshData
  } = useContentStrategy();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { syncProposalAcrossTabs, updateProposalStatus } = useProposalIntegration();
  const { checkOverdueProposals } = useProposalRestoration();

  const stages = [
    { id: 'to_be_written', label: 'To Be Written', color: 'from-blue-500/30 to-cyan-500/30' },
    { id: 'in_progress', label: 'In Progress', color: 'from-yellow-500/30 to-orange-500/30' },
    { id: 'review', label: 'Review', color: 'from-green-500/30 to-emerald-500/30' },
    { id: 'scheduled', label: 'Scheduled', color: 'from-indigo-500/30 to-blue-500/30' },
    { id: 'published', label: 'Published', color: 'from-gray-500/30 to-gray-600/30' }
  ];

  const handleRefreshOverdue = async () => {
    try {
      await checkOverdueProposals();
      await refreshData();
      toast.success('Checked for overdue content and updated pipeline');
    } catch (error) {
      toast.error('Failed to check overdue content');
    }
  };

  const getItemsByStage = (stageId: string) => {
    return pipelineItems.filter(item => item.stage === stageId);
  };

  const handleAddItem = (stageId?: string) => {
    setEditingItem(stageId ? { stage: stageId } : null);
    setDialogOpen(true);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this pipeline item?')) {
      try {
        await deletePipelineItem(itemId);
        toast.success('Pipeline item deleted');
      } catch (error) {
        toast.error('Failed to delete pipeline item');
      }
    }
  };

  const handleSaveItem = async (formData: any) => {
    try {
      if (editingItem) {
        await updatePipelineItem(editingItem.id, formData);
        toast.success('Pipeline item updated');
      } else {
        await createPipelineItem(formData);
        toast.success('Pipeline item created');
      }
      setDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Failed to save pipeline item');
    }
  };

  const handleStageChange = async (item: any, newStage: string) => {
    try {
      await updatePipelineItem(item.id, { stage: newStage });
      
      // Update proposal status if it's linked to a proposal
      if (item.source_proposal_id) {
        await updateProposalStatus({
          proposalId: item.source_proposal_id,
          status: newStage === 'published' ? 'completed' : 'in-progress',
          pipelineStage: newStage,
          progress: newStage === 'published' ? 100 : undefined,
          notes: `Pipeline stage changed to ${newStage}`,
          updatedBy: 'user'
        });
      }
      
      toast.success(`Moved to ${newStage}`);
    } catch (error) {
      toast.error('Failed to update stage');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-background/80 via-background/60 to-background/40 backdrop-blur-xl border-border/50 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-foreground">Loading pipeline...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Dashboard */}
      {showAnalytics && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PipelineAnalyticsDashboard 
            pipelineItems={pipelineItems} 
            calendarItems={calendarItems}
          />
        </motion.div>
      )}

      {/* Main Pipeline */}
      <Card className="bg-gradient-to-br from-background/90 via-background/80 to-background/70 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl backdrop-blur-sm border border-white/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Content Production Pipeline
              </span>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {pipelineItems.length} items
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80"
              >
                📊 {showAnalytics ? 'Hide' : 'Show'} Analytics
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshOverdue}
                className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Check Overdue
              </Button>
              <Button 
                size="sm" 
                className="bg-primary/20 hover:bg-primary/30 backdrop-blur-sm" 
                onClick={() => handleAddItem()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Content
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-3">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 min-h-[400px]">
            {stages.map((stage, index) => (
              <React.Fragment key={stage.id}>
                <PipelineStageColumn
                  stage={stage}
                  items={getItemsByStage(stage.id)}
                  stageIndex={index}
                  totalStages={stages.length}
                  stages={stages}
                  onAddItem={handleAddItem}
                  onEditItem={handleEditItem}
                  onDeleteItem={handleDeleteItem}
                  onStageChange={handleStageChange}
                  onSyncProposal={syncProposalAcrossTabs}
                  calendarItems={calendarItems}
                />
                
                {/* Stage Connector */}
                {index < stages.length - 1 && (
                  <div className="hidden lg:flex justify-center items-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <ArrowRight className="h-5 w-5 text-primary animate-pulse" />
                      <div className="text-xs text-muted-foreground">Next</div>
                    </motion.div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Item Dialog */}
      <PipelineItemDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        item={editingItem}
      />
    </div>
  );
};
