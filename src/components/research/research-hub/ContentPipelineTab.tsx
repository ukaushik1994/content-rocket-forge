import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Target, FileText, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const ContentPipelineTab: React.FC = () => {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Mock research data that would come from other tabs
  const researchItems = [
    {
      id: '1',
      type: 'keyword',
      title: 'content marketing strategy',
      source: 'Keyword Intelligence',
      opportunity: 'High volume, medium competition',
      searchVolume: '8.1K',
      difficulty: 'Medium',
      priority: 'High',
      status: 'ready'
    },
    {
      id: '2',
      type: 'question',
      title: 'What is content marketing?',
      source: 'People Questions',
      opportunity: 'High-intent informational query',
      searchVolume: '2.4K',
      difficulty: 'Low',
      priority: 'Medium',
      status: 'ready'
    },
    {
      id: '3',
      type: 'gap',
      title: 'Content creation tools comparison',
      source: 'Content Gaps',
      opportunity: 'Competitor gap identified',
      searchVolume: '1.8K',
      difficulty: 'Low',
      priority: 'High',
      status: 'ready'
    },
    {
      id: '4',
      type: 'keyword',
      title: 'SEO content optimization',
      source: 'Keyword Intelligence',
      opportunity: 'Rising trend topic',
      searchVolume: '3.2K',
      difficulty: 'Medium',
      priority: 'Medium',
      status: 'in-progress'
    },
    {
      id: '5',
      type: 'question',
      title: 'How to measure content marketing ROI?',
      source: 'People Questions',
      opportunity: 'Business-focused question',
      searchVolume: '1.2K',
      difficulty: 'Low',
      priority: 'Low',
      status: 'scheduled'
    }
  ];

  const quickActions = [
    {
      title: 'Blog Post',
      description: 'Create comprehensive blog content',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      action: () => handleCreateContent('blog')
    },
    {
      title: 'FAQ Page',
      description: 'Answer multiple related questions',
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      action: () => handleCreateContent('faq')
    },
    {
      title: 'Landing Page',
      description: 'High-converting product page',
      icon: Calendar,
      color: 'from-green-500 to-green-600',
      action: () => handleCreateContent('landing')
    }
  ];

  const handleCreateContent = (type: string) => {
    if (selectedItems.length === 0) {
      toast.error('Please select research items to create content');
      return;
    }

    const selectedResearch = researchItems.filter(item => selectedItems.includes(item.id));
    
    navigate('/content-builder', {
      state: {
        researchData: selectedResearch,
        contentType: type,
        step: 1
      }
    });

    toast.success(`🚀 Creating ${type} with ${selectedItems.length} research insights!`);
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === researchItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(researchItems.map(item => item.id));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'keyword':
        return '🔍';
      case 'question':
        return '❓';
      case 'gap':
        return '📊';
      default:
        return '📝';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'border-red-500/30 text-red-400 bg-red-500/10';
      case 'Medium':
        return 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10';
      case 'Low':
        return 'border-green-500/30 text-green-400 bg-green-500/10';
      default:
        return 'border-gray-500/30 text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Description with glassmorphism */}
      <motion.div 
        className="text-center space-y-6 bg-gradient-to-b from-white/5 to-transparent p-8 rounded-2xl border border-white/10 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2 
          className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent flex items-center justify-center gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Plus className="h-7 w-7 text-pink-400" />
          Content Creation Pipeline
        </motion.h2>
        <motion.p 
          className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          Transform your research into content. Select insights from keyword research, content gaps, and people questions to create high-performing content.
        </motion.p>
      </motion.div>

      {/* Quick Actions */}
      <Card className="bg-black/20 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Quick Content Creation
          </CardTitle>
          {selectedItems.length > 0 && (
            <Badge className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border-pink-500/30">
              {selectedItems.length} items selected
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card 
                  className={`cursor-pointer hover:border-pink-500/50 transition-all duration-300 bg-black/10 backdrop-blur-sm border-white/20 hover:shadow-2xl hover:shadow-pink-500/25 ${
                    selectedItems.length === 0 ? 'opacity-50' : ''
                  }`}
                  onClick={action.action}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2 text-white">{action.title}</h3>
                    <p className="text-sm text-white/70">{action.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Research Items Pipeline */}
      <Card className="bg-black/20 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Research Queue
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            {selectedItems.length === researchItems.length ? 'Deselect All' : 'Select All'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {researchItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                selectedItems.includes(item.id)
                  ? 'border-primary bg-primary/10'
                  : 'border-border/50 bg-background/40'
              }`}
              onClick={() => handleSelectItem(item.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(item.type)}</span>
                    {selectedItems.includes(item.id) && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">✓</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      <Badge variant="outline" className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>From: {item.source}</span>
                      <span>•</span>
                      <span>{item.opportunity}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-foreground font-medium">{item.searchVolume}</div>
                    <div className="text-muted-foreground">Volume</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-medium ${
                      item.difficulty === 'Low' ? 'text-green-400' :
                      item.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {item.difficulty}
                    </div>
                    <div className="text-muted-foreground">Difficulty</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Pipeline Summary */}
      <Card className="bg-background/40 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Pipeline Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-background/60 rounded-lg">
              <div className="text-2xl font-bold text-green-400">3</div>
              <div className="text-sm text-muted-foreground">Ready to Create</div>
            </div>
            <div className="p-3 bg-background/60 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">1</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="p-3 bg-background/60 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">1</div>
              <div className="text-sm text-muted-foreground">Scheduled</div>
            </div>
            <div className="p-3 bg-background/60 rounded-lg">
              <div className="text-2xl font-bold text-primary">16.7K</div>
              <div className="text-sm text-muted-foreground">Total Volume</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {researchItems.length === 0 && (
        <Card className="bg-background/40 backdrop-blur-sm border-border/50">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Research Items Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start by conducting keyword research, analyzing content gaps, or exploring people questions to populate your content pipeline.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                Keywords
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Content Gaps
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Questions
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};