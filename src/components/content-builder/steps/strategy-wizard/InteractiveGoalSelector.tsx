
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Award, Users, DollarSign, Search, Heart, MessageSquare } from 'lucide-react';

interface InteractiveGoalSelectorProps {
  data: any;
  onChange: (data: any) => void;
}

const contentGoals = [
  {
    id: 'brand-awareness',
    title: 'Brand Awareness',
    description: 'Increase visibility and recognition of your brand',
    icon: Award,
    color: 'from-purple-500 to-pink-500',
    metrics: ['Impressions', 'Reach', 'Brand Mentions'],
    difficulty: 'Medium',
    timeframe: '3-6 months'
  },
  {
    id: 'lead-generation',
    title: 'Lead Generation',
    description: 'Generate qualified leads for your business',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    metrics: ['Form Submissions', 'Email Signups', 'Contact Requests'],
    difficulty: 'High',
    timeframe: '1-3 months'
  },
  {
    id: 'customer-education',
    title: 'Customer Education',
    description: 'Educate your audience about your products or industry',
    icon: Target,
    color: 'from-green-500 to-emerald-500',
    metrics: ['Time on Page', 'Content Completion', 'Resource Downloads'],
    difficulty: 'Low',
    timeframe: '2-4 months'
  },
  {
    id: 'thought-leadership',
    title: 'Thought Leadership',
    description: 'Establish authority and expertise in your field',
    icon: TrendingUp,
    color: 'from-orange-500 to-red-500',
    metrics: ['Shares', 'Backlinks', 'Speaking Opportunities'],
    difficulty: 'High',
    timeframe: '6-12 months'
  },
  {
    id: 'product-promotion',
    title: 'Product Promotion',
    description: 'Drive awareness and sales of specific products',
    icon: DollarSign,
    color: 'from-yellow-500 to-orange-500',
    metrics: ['Click-through Rate', 'Conversion Rate', 'Sales'],
    difficulty: 'Medium',
    timeframe: '1-2 months'
  },
  {
    id: 'seo-traffic',
    title: 'SEO/Organic Traffic',
    description: 'Improve search rankings and organic visibility',
    icon: Search,
    color: 'from-indigo-500 to-purple-500',
    metrics: ['Keyword Rankings', 'Organic Traffic', 'SERP Visibility'],
    difficulty: 'High',
    timeframe: '3-9 months'
  },
  {
    id: 'customer-retention',
    title: 'Customer Retention',
    description: 'Keep existing customers engaged and loyal',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    metrics: ['Repeat Visits', 'Customer Lifetime Value', 'Churn Rate'],
    difficulty: 'Medium',
    timeframe: '2-6 months'
  },
  {
    id: 'community-building',
    title: 'Community Building',
    description: 'Foster a community around your brand',
    icon: MessageSquare,
    color: 'from-teal-500 to-blue-500',
    metrics: ['Community Size', 'Engagement Rate', 'User-Generated Content'],
    difficulty: 'High',
    timeframe: '6-18 months'
  }
];

export const InteractiveGoalSelector: React.FC<InteractiveGoalSelectorProps> = ({
  data,
  onChange
}) => {
  const [hoveredGoal, setHoveredGoal] = useState<string | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(data.contentGoals || []);

  const handleGoalToggle = (goalId: string) => {
    const updated = selectedGoals.includes(goalId)
      ? selectedGoals.filter(id => id !== goalId)
      : [...selectedGoals, goalId];
    
    setSelectedGoals(updated);
    onChange({
      ...data,
      contentGoals: updated
    });
  };

  const getCompatibilityScore = (goal1: string, goal2: string) => {
    // Simple compatibility matrix (in real app, this would be more sophisticated)
    const compatibility: Record<string, Record<string, number>> = {
      'brand-awareness': { 'thought-leadership': 90, 'community-building': 85, 'customer-education': 80 },
      'lead-generation': { 'product-promotion': 95, 'seo-traffic': 85, 'customer-education': 75 },
      'seo-traffic': { 'customer-education': 90, 'thought-leadership': 85, 'lead-generation': 80 }
    };
    
    return compatibility[goal1]?.[goal2] || compatibility[goal2]?.[goal1] || 60;
  };

  const averageCompatibilityScore = selectedGoals.length > 1 
    ? selectedGoals.reduce((acc, goal1, i) => {
        const scores = selectedGoals.slice(i + 1).map(goal2 => getCompatibilityScore(goal1, goal2));
        return acc + scores.reduce((sum, score) => sum + score, 0);
      }, 0) / Math.max(1, (selectedGoals.length * (selectedGoals.length - 1)) / 2)
    : 100;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <Target className="h-8 w-8 text-neon-purple" />
          <h2 className="text-3xl font-bold text-gradient">Set Your Content Goals</h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose your primary objectives to create focused, results-driven content
        </p>
      </motion.div>

      {/* Goal Compatibility Score */}
      {selectedGoals.length > 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-6 text-center"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Goal Compatibility Analysis</h3>
          <div className="space-y-3">
            <Progress value={averageCompatibilityScore} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Your selected goals have a {Math.round(averageCompatibilityScore)}% compatibility score
            </p>
            <Badge variant={averageCompatibilityScore > 80 ? "default" : averageCompatibilityScore > 60 ? "secondary" : "destructive"}>
              {averageCompatibilityScore > 80 ? "Excellent Synergy" : 
               averageCompatibilityScore > 60 ? "Good Alignment" : "Consider Focus"}
            </Badge>
          </div>
        </motion.div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentGoals.map((goal, index) => {
          const IconComponent = goal.icon;
          const isSelected = selectedGoals.includes(goal.id);
          const isHovered = hoveredGoal === goal.id;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredGoal(goal.id)}
              onHoverEnd={() => setHoveredGoal(null)}
              className={`relative cursor-pointer transition-all duration-300 ${
                isSelected ? 'scale-105' : ''
              }`}
              onClick={() => handleGoalToggle(goal.id)}
            >
              <Card className={`glass-panel h-full transition-all duration-300 ${
                isSelected 
                  ? 'border-neon-blue shadow-neon-glow' 
                  : 'border-white/10 hover:border-white/30'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${goal.color} bg-opacity-20`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          className="w-6 h-6 bg-neon-blue rounded-full flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <Badge variant={
                        goal.difficulty === 'Low' ? 'default' : 
                        goal.difficulty === 'Medium' ? 'secondary' : 'destructive'
                      } className="text-xs">
                        {goal.difficulty}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Timeline:</span>
                      <span className="text-white">{goal.timeframe}</span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {(isHovered || isSelected) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-white/10 pt-3"
                      >
                        <p className="text-xs text-muted-foreground mb-2">Key Metrics:</p>
                        <div className="flex flex-wrap gap-1">
                          {goal.metrics.map((metric, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {metric}
                            </Badge>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Goals Summary */}
      {selectedGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Selected Goals Summary</h3>
          <div className="flex flex-wrap gap-2">
            {selectedGoals.map((goalId) => {
              const goal = contentGoals.find(g => g.id === goalId);
              if (!goal) return null;
              
              return (
                <Badge
                  key={goalId}
                  className="bg-gradient-to-r from-neon-purple to-neon-blue text-white"
                >
                  {goal.title}
                </Badge>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};
