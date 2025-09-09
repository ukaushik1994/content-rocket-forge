import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { MinimalPipelineCard } from './MinimalPipelineCard';

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
  const [showAll, setShowAll] = useState(false);
  const ITEMS_LIMIT = 6;
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
  
  const displayItems = showAll ? items : items.slice(0, ITEMS_LIMIT);
  const hasMoreItems = items.length > ITEMS_LIMIT;

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
      <Card className="flex-1 bg-card/80 backdrop-blur border-border/50">
        <CardHeader className="pb-2 px-3 pt-3">
          {/* Stage Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded-lg bg-gradient-to-r ${stage.color} text-white text-xs font-medium`}>
                {stage.label}
              </div>
              <Badge variant="outline" className="text-xs">
                {showAll ? items.length : Math.min(items.length, ITEMS_LIMIT)}
                {!showAll && items.length > ITEMS_LIMIT && `/${items.length}`}
              </Badge>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddItem(stage.id)}
              className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 pt-0 px-3 pb-3">
          <div className="space-y-2 min-h-[200px]">
            {/* Pipeline Items */}
            {displayItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <MinimalPipelineCard
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
            
            {/* Show More/Less Button */}
            {hasMoreItems && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center pt-1"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Show {items.length - ITEMS_LIMIT} More
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Scheduled Calendar Items (for scheduled stage only) */}
            {stage.id === 'scheduled' && scheduledItems.map((item, index) => (
              <motion.div
                key={`calendar-${item.id}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (displayItems.length + index) * 0.02 }}
              >
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-3 w-3 text-primary" />
                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                        Calendar
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm text-foreground mb-2 line-clamp-1">{item.title}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{item.scheduled_date}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.status}
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
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center justify-center h-24 border border-dashed border-border/50 rounded-lg bg-muted/10 hover:bg-muted/20 transition-all cursor-pointer group"
                onClick={() => onAddItem(stage.id)}
              >
                <div className="text-center space-y-1">
                  <Plus className="h-4 w-4 text-muted-foreground group-hover:text-foreground mx-auto" />
                  <p className="text-xs text-muted-foreground group-hover:text-foreground">Add content</p>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};