import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { EnhancedPipelineCard } from './EnhancedPipelineCard';

interface PipelineStageColumnProps {
  stage: { id: string; label: string; color: string };
  items: any[];
  stageIndex: number;
  totalStages: number;
  stages: Array<{ id: string; label: string; color: string }>;
  onAddItem: (stageId: string) => void;
  onEditItem: (item: any) => void;
  onDeleteItem: (itemId: string) => void;
  onStageChange: (item: any, newStage: string) => void;
  onSyncProposal?: (proposalId: string, action: string, data?: any) => Promise<void>;
  calendarItems?: any[]; // For showing scheduled items in scheduled stage
}

export const PipelineStageColumn: React.FC<PipelineStageColumnProps> = ({
  stage,
  items,
  stageIndex,
  totalStages,
  stages,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onStageChange,
  onSyncProposal,
  calendarItems = []
}) => {
  // Get calendar items that should show in scheduled stage
  const getScheduledItems = () => {
    if (stage.id !== 'scheduled') return [];
    return calendarItems.filter(item => 
      ['scheduled', 'planning'].includes(item.status) && 
      !items.some(pipelineItem => pipelineItem.calendar_item_id === item.id)
    );
  };

  const scheduledItems = getScheduledItems();
  const allItems = [...items, ...scheduledItems];

  const columnVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, delay: stageIndex * 0.1 }
    }
  };

  const getStageStats = () => {
    const totalItems = allItems.length;
    const avgProgress = totalItems > 0 
      ? Math.round(allItems.reduce((acc, item) => acc + (item.progress_percentage || 0), 0) / totalItems) 
      : 0;
    const highPriorityCount = items.filter(item => item.priority === 'high').length;
    
    return { totalItems, avgProgress, highPriorityCount };
  };

  const { totalItems, avgProgress, highPriorityCount } = getStageStats();

  return (
    <motion.div
      variants={columnVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full"
    >
      <Card className="flex-1 bg-gradient-to-br from-background/90 via-background/80 to-background/70 backdrop-blur-xl border-border/50 shadow-lg">
        <CardHeader className="pb-3">
          {/* Stage Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-2 rounded-xl bg-gradient-to-r ${stage.color} border border-white/10 backdrop-blur-sm`}>
                <h3 className="text-sm font-semibold text-white">{stage.label}</h3>
              </div>
              <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">
                {totalItems}
              </Badge>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddItem(stage.id)}
              className="h-8 w-8 p-0 hover:bg-primary/20 text-muted-foreground hover:text-primary"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Stage Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            {totalItems > 0 && (
              <>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>{avgProgress}% avg progress</span>
                </div>
                {highPriorityCount > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>{highPriorityCount} high priority</span>
                  </div>
                )}
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 pt-0">
          <div className="space-y-3 min-h-[400px]">
            {/* Pipeline Items */}
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <EnhancedPipelineCard
                  item={item}
                  stageIndex={stageIndex}
                  totalStages={totalStages}
                  stages={stages}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                  onStageChange={onStageChange}
                  onSyncProposal={onSyncProposal}
                />
              </motion.div>
            ))}

            {/* Scheduled Calendar Items (for scheduled stage only) */}
            {stage.id === 'scheduled' && scheduledItems.map((item, index) => (
              <motion.div
                key={`calendar-${item.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (items.length + index) * 0.05 }}
              >
                <Card className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent backdrop-blur-xl border-blue-400/30 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-300 border-blue-400/30">
                        From Calendar
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm text-foreground mb-2">{item.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Scheduled: {item.scheduled_date}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-400/30">
                        {item.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.content_type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Empty State */}
            {allItems.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border/30 rounded-xl bg-muted/20 backdrop-blur-sm hover:border-border/50 hover:bg-muted/30 transition-all cursor-pointer group"
                onClick={() => onAddItem(stage.id)}
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">No content yet</p>
                    <p className="text-xs text-muted-foreground">Click to add new content</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};