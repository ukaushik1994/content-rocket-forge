
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Clock, User, Target, Plus, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { PipelineItemDialog } from './PipelineItemDialog';
import { toast } from 'sonner';

interface ContentPipelineProps {
  goals: any;
}

export const ContentPipeline = ({ goals }: ContentPipelineProps) => {
  const { pipelineItems, createPipelineItem, updatePipelineItem, deletePipelineItem, loading } = useContentStrategy();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const stages = [
    { id: 'ideation', label: 'Ideation', color: 'from-blue-500 to-cyan-500' },
    { id: 'research', label: 'Research', color: 'from-purple-500 to-pink-500' },
    { id: 'writing', label: 'Writing', color: 'from-yellow-500 to-orange-500' },
    { id: 'review', label: 'Review', color: 'from-green-500 to-emerald-500' },
    { id: 'scheduled', label: 'Scheduled', color: 'from-indigo-500 to-blue-500' },
    { id: 'published', label: 'Published', color: 'from-gray-500 to-gray-600' }
  ];

  const getStageColor = (stage: string) => {
    const stageObj = stages.find(s => s.id === stage);
    return stageObj?.color || 'from-gray-500 to-gray-600';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-500/20 text-red-300 border-red-500/30',
      medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      low: 'bg-green-500/20 text-green-300 border-green-500/30'
    };
    return colors[priority as keyof typeof colors];
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      blog: '📝',
      social: '📱',
      video: '🎬',
      email: '✉️'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  const getItemsByStage = (stageId: string) => {
    return pipelineItems.filter(item => item.stage === stageId);
  };

  const handleAddItem = (stage?: string) => {
    setEditingItem(null);
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
      toast.success(`Moved to ${newStage}`);
    } catch (error) {
      toast.error('Failed to update stage');
    }
  };

  if (loading) {
    return (
      <Card className="glass-panel border-white/10 shadow-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-white">Loading pipeline...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalItems = pipelineItems.length;
  const inProgressItems = pipelineItems.filter(item => ['research', 'writing'].includes(item.stage)).length;
  const avgProgress = totalItems > 0 ? Math.round(pipelineItems.reduce((acc, item) => acc + (item.progress_percentage || 0), 0) / totalItems) : 0;
  const highPriorityItems = pipelineItems.filter(item => item.priority === 'high').length;

  return (
    <>
      <Card className="glass-panel border-white/10 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl backdrop-blur-sm border border-white/10">
                <Target className="h-6 w-6 text-green-400" />
              </div>
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Content Pipeline
              </span>
              <Badge variant="outline" className="text-green-400 border-green-400">
                {totalItems} items
              </Badge>
            </div>
            <Button size="sm" className="bg-primary/20 hover:bg-primary/30" onClick={() => handleAddItem()}>
              <Plus className="h-4 w-4 mr-1" />
              Add Content
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            {stages.map((stage, index) => {
              const stageItems = getItemsByStage(stage.id);
              
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-2 rounded-lg bg-gradient-to-r ${stage.color} bg-opacity-20 border border-white/10`}>
                      <h3 className="text-sm font-semibold text-white">{stage.label}</h3>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {stageItems.length}
                    </Badge>
                  </div>

                  <div className="space-y-3 min-h-[200px]">
                    {stageItems.map(item => (
                       <motion.div
                         key={item.id}
                         whileHover={{ scale: 1.02, y: -2 }}
                         className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-all cursor-pointer group"
                       >
                         <div className="flex items-start gap-3 mb-3">
                           {/* Item Image */}
                           {item.image_url && (
                             <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                               <img 
                                 src={item.image_url} 
                                 alt={item.title}
                                 className="w-full h-full object-cover"
                                 onError={(e) => {
                                   const target = e.target as HTMLImageElement;
                                   target.style.display = 'none';
                                   const parent = target.parentElement;
                                   if (parent) {
                                     parent.innerHTML = `<div class="w-full h-full bg-primary/20 flex items-center justify-center text-lg">${getTypeIcon(item.content_type)}</div>`;
                                   }
                                 }}
                               />
                             </div>
                           )}
                           
                           <div className="flex-1">
                             <div className="flex items-start justify-between mb-2">
                               <div className="flex items-center gap-2">
                                 <span className="text-lg">{getTypeIcon(item.content_type)}</span>
                                 <Badge variant="outline" className={getPriorityColor(item.priority)}>
                                   {item.priority}
                                 </Badge>
                                 {item.source_proposal_id && (
                                   <Badge variant="secondary" className="text-xs bg-primary/20 text-primary-foreground">
                                     AI Proposal
                                   </Badge>
                                 )}
                               </div>
                               <div className="flex items-center gap-1">
                                 <div className="text-xs text-muted-foreground flex items-center gap-1">
                                   <Clock className="h-3 w-3" />
                                   {item.due_date || 'No date'}
                                 </div>
                                 <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2">
                                   <button
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       handleEditItem(item);
                                     }}
                                     className="hover:text-blue-400"
                                   >
                                     <Edit className="h-3 w-3" />
                                   </button>
                                   <button
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       handleDeleteItem(item.id);
                                     }}
                                     className="hover:text-red-400"
                                   >
                                     <Trash2 className="h-3 w-3" />
                                   </button>
                                 </div>
                               </div>
                             </div>

                             <h4 className="font-medium text-white text-sm mb-2 line-clamp-2">
                               {item.title}
                             </h4>
                           </div>
                         </div>

                         <div className="space-y-2">
                           <div className="flex items-center gap-2 text-xs text-muted-foreground">
                             <User className="h-3 w-3" />
                             {item.assigned_to || 'Unassigned'}
                           </div>
                           
                           <div>
                             <div className="flex justify-between text-xs mb-1">
                               <span className="text-muted-foreground">Progress</span>
                               <span className="text-white">{item.progress_percentage || 0}%</span>
                             </div>
                             <Progress 
                               value={item.progress_percentage || 0} 
                               className="h-2 bg-gray-800"
                             />
                           </div>

                           {/* Stage Navigation */}
                           <div className="flex justify-between items-center pt-2">
                             {index > 0 && (
                               <Button
                                 size="sm"
                                 variant="ghost"
                                 className="text-xs p-1 h-6"
                                 onClick={() => handleStageChange(item, stages[index - 1].id)}
                               >
                                 ←
                               </Button>
                             )}
                             {index < stages.length - 1 && (
                               <Button
                                 size="sm"
                                 variant="ghost"
                                 className="text-xs p-1 h-6 ml-auto"
                                 onClick={() => handleStageChange(item, stages[index + 1].id)}
                               >
                                 →
                               </Button>
                             )}
                           </div>
                         </div>
                       </motion.div>
                    ))}
                    
                    {stageItems.length === 0 && (
                      <div className="flex items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-lg">
                        <button 
                          onClick={() => handleAddItem(stage.id)}
                          className="text-center text-muted-foreground hover:text-white transition-colors"
                        >
                          <div className="text-2xl mb-2">+</div>
                          <div className="text-xs">Add content</div>
                        </button>
                      </div>
                    )}
                  </div>

                  {index < stages.length - 1 && (
                    <div className="hidden lg:flex justify-center items-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Pipeline Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-blue-400">{totalItems}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </div>
            <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-yellow-400">{inProgressItems}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-green-400">{avgProgress}%</div>
              <div className="text-sm text-muted-foreground">Avg Progress</div>
            </div>
            <div className="p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-red-400">{highPriorityItems}</div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <PipelineItemDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        item={editingItem}
      />
    </>
  );
};
