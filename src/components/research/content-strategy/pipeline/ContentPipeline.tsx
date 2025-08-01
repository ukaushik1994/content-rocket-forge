
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Clock, User, Target, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface PipelineItem {
  id: string;
  title: string;
  type: 'blog' | 'social' | 'video' | 'email';
  stage: 'ideation' | 'research' | 'writing' | 'review' | 'scheduled' | 'published';
  progress: number;
  assignee: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

interface ContentPipelineProps {
  goals: any;
}

export const ContentPipeline = ({ goals }: ContentPipelineProps) => {
  const [pipelineItems] = useState<PipelineItem[]>([
    {
      id: '1',
      title: `Complete ${goals.mainKeyword} Guide`,
      type: 'blog',
      stage: 'writing',
      progress: 65,
      assignee: 'Sarah',
      dueDate: 'Jan 15',
      priority: 'high'
    },
    {
      id: '2',
      title: `${goals.mainKeyword} Case Study`,
      type: 'blog',
      stage: 'research',
      progress: 30,
      assignee: 'Mike',
      dueDate: 'Jan 18',
      priority: 'medium'
    },
    {
      id: '3',
      title: `${goals.mainKeyword} Tips Video`,
      type: 'video',
      stage: 'ideation',
      progress: 10,
      assignee: 'Alex',
      dueDate: 'Jan 22',
      priority: 'low'
    },
    {
      id: '4',
      title: `${goals.mainKeyword} Email Series`,
      type: 'email',
      stage: 'review',
      progress: 85,
      assignee: 'Sarah',
      dueDate: 'Jan 12',
      priority: 'high'
    }
  ]);

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

  return (
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
              {pipelineItems.length} items
            </Badge>
          </div>
          <Button size="sm" className="bg-primary/20 hover:bg-primary/30">
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
                      className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getTypeIcon(item.type)}</span>
                          <Badge variant="outline" className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.dueDate}
                        </div>
                      </div>

                      <h4 className="font-medium text-white text-sm mb-2 line-clamp-2">
                        {item.title}
                      </h4>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {item.assignee}
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-white">{item.progress}%</span>
                          </div>
                          <Progress 
                            value={item.progress} 
                            className="h-2 bg-gray-800"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {stageItems.length === 0 && (
                    <div className="flex items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <div className="text-2xl mb-2">+</div>
                        <div className="text-xs">Add content</div>
                      </div>
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
            <div className="text-2xl font-bold text-blue-400">{pipelineItems.length}</div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </div>
          <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-white/10">
            <div className="text-2xl font-bold text-yellow-400">
              {pipelineItems.filter(item => ['research', 'writing'].includes(item.stage)).length}
            </div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-white/10">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(pipelineItems.reduce((acc, item) => acc + item.progress, 0) / pipelineItems.length)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Progress</div>
          </div>
          <div className="p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-lg border border-white/10">
            <div className="text-2xl font-bold text-red-400">
              {pipelineItems.filter(item => item.priority === 'high').length}
            </div>
            <div className="text-sm text-muted-foreground">High Priority</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
