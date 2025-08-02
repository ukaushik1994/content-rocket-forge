import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Wand2, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { toast } from 'sonner';

interface CustomStrategyCreatorProps {
  onClose: () => void;
  goals: any;
}

export const CustomStrategyCreator = ({ onClose, goals }: CustomStrategyCreatorProps) => {
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState({
    title: '',
    description: '',
    difficulty: 'Medium',
    timeframe: goals.timeline || '3 months',
    contentPieces: parseInt(goals.contentPieces) || 12,
    topics: [] as string[],
    implementation: [] as string[]
  });
  const [newTopic, setNewTopic] = useState('');
  const [newImplementationStep, setNewImplementationStep] = useState('');
  
  const { createStrategy } = useContentStrategy();

  const addTopic = () => {
    if (newTopic.trim() && !strategy.topics.includes(newTopic.trim())) {
      setStrategy(prev => ({
        ...prev,
        topics: [...prev.topics, newTopic.trim()]
      }));
      setNewTopic('');
    }
  };

  const removeTopic = (index: number) => {
    setStrategy(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    }));
  };

  const addImplementationStep = () => {
    if (newImplementationStep.trim()) {
      setStrategy(prev => ({
        ...prev,
        implementation: [...prev.implementation, newImplementationStep.trim()]
      }));
      setNewImplementationStep('');
    }
  };

  const removeImplementationStep = (index: number) => {
    setStrategy(prev => ({
      ...prev,
      implementation: prev.implementation.filter((_, i) => i !== index)
    }));
  };

  const generateAISuggestions = () => {
    // AI-powered suggestions based on goals and keyword
    const aiTopics = [
      "Comprehensive guides",
      "How-to tutorials",
      "Industry analysis",
      "Tool comparisons",
      "Case studies",
      "Best practices",
      "Expert interviews",
      "Interactive content",
      "Video content",
      "Infographics"
    ];

    const aiSteps = [
      `Create pillar content targeting "${goals.mainKeyword}"`,
      "Develop comprehensive topic cluster strategy",
      "Implement advanced on-page SEO optimization",
      "Build strategic internal linking structure",
      "Create engaging multimedia content",
      "Establish content promotion workflow"
    ];

    setStrategy(prev => ({
      ...prev,
      topics: [...new Set([...prev.topics, ...aiTopics.slice(0, 5)])],
      implementation: [...new Set([...prev.implementation, ...aiSteps])]
    }));

    toast.success('AI suggestions added to your strategy!');
  };

  const handleSave = async () => {
    if (!strategy.title.trim()) {
      toast.error('Please enter a strategy title');
      return;
    }

    setLoading(true);
    try {
      await createStrategy({
        name: strategy.title,
        monthly_traffic_goal: undefined,
        content_pieces_per_month: strategy.contentPieces,
        timeline: strategy.timeframe,
        main_keyword: goals.mainKeyword,
        target_audience: goals.audience || undefined,
        brand_voice: goals.voice || undefined,
        content_pillars: strategy.topics
      });
      
      toast.success('Custom strategy created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating custom strategy:', error);
      toast.error('Failed to create strategy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Wand2 className="h-6 w-6 text-primary" />
              Create Custom Strategy
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white/60 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Strategy Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Strategy Title</label>
            <Input
              value={strategy.title}
              onChange={(e) => setStrategy(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter your strategy name..."
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Strategy Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Description</label>
            <Textarea
              value={strategy.description}
              onChange={(e) => setStrategy(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your content strategy approach..."
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
            />
          </div>

          {/* Strategy Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Difficulty Level</label>
              <Select value={strategy.difficulty} onValueChange={(value) => setStrategy(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Timeframe</label>
              <Input
                value={strategy.timeframe}
                onChange={(e) => setStrategy(prev => ({ ...prev, timeframe: e.target.value }))}
                placeholder="e.g., 3 months"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Content Pieces</label>
              <Input
                type="number"
                value={strategy.contentPieces}
                onChange={(e) => setStrategy(prev => ({ ...prev, contentPieces: parseInt(e.target.value) || 0 }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Content Topics */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white">Content Topics</label>
              <Button onClick={generateAISuggestions} variant="outline" size="sm" className="text-primary border-primary">
                <Wand2 className="h-4 w-4 mr-2" />
                AI Suggestions
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Add a content topic..."
                className="bg-white/5 border-white/10 text-white"
                onKeyPress={(e) => e.key === 'Enter' && addTopic()}
              />
              <Button onClick={addTopic} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {strategy.topics.map((topic, index) => (
                <Badge key={index} variant="outline" className="text-white border-white/20 flex items-center gap-1">
                  {topic}
                  <button onClick={() => removeTopic(index)} className="ml-1 hover:text-red-400">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Implementation Steps */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-white">Implementation Steps</label>
            <div className="flex gap-2">
              <Input
                value={newImplementationStep}
                onChange={(e) => setNewImplementationStep(e.target.value)}
                placeholder="Add an implementation step..."
                className="bg-white/5 border-white/10 text-white"
                onKeyPress={(e) => e.key === 'Enter' && addImplementationStep()}
              />
              <Button onClick={addImplementationStep} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {strategy.implementation.map((step, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-white/80 flex-1">{step}</span>
                  <button onClick={() => removeImplementationStep(index)} className="text-white/40 hover:text-red-400">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Strategy...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Strategy
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};