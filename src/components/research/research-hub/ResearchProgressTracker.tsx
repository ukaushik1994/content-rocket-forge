import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Search, FileSearch, Users, BarChart3, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ResearchProgressTrackerProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const ResearchProgressTracker: React.FC<ResearchProgressTrackerProps> = ({ activeTab, onTabChange }) => {
  const steps = [
    {
      id: 'keyword-intelligence',
      title: 'Keyword Research',
      description: 'Find high-value keywords',
      icon: Search,
      color: 'blue',
      completed: true // This would be dynamic based on actual progress
    },
    {
      id: 'content-gaps',
      title: 'Content Gaps',
      description: 'Identify opportunities',
      icon: FileSearch,
      color: 'purple',
      completed: false
    },
    {
      id: 'people-questions',
      title: 'People Questions',
      description: 'Understand audience needs',
      icon: Users,
      color: 'green',
      completed: false
    },
    {
      id: 'research-insights',
      title: 'Research Insights',
      description: 'Analyze your findings',
      icon: BarChart3,
      color: 'orange',
      completed: false
    },
    {
      id: 'content-pipeline',
      title: 'Create Content',
      description: 'Transform insights to content',
      icon: Plus,
      color: 'pink',
      completed: false
    }
  ];

  const getStepIndex = (stepId: string) => steps.findIndex(step => step.id === stepId);
  const currentStepIndex = getStepIndex(activeTab);

  const getColorClasses = (color: string, isActive: boolean, isCompleted: boolean) => {
    const colorMap = {
      blue: isActive ? 'from-blue-500 to-blue-600' : isCompleted ? 'from-blue-400 to-blue-500' : 'from-gray-600 to-gray-700',
      purple: isActive ? 'from-purple-500 to-purple-600' : isCompleted ? 'from-purple-400 to-purple-500' : 'from-gray-600 to-gray-700',
      green: isActive ? 'from-green-500 to-green-600' : isCompleted ? 'from-green-400 to-green-500' : 'from-gray-600 to-gray-700',
      orange: isActive ? 'from-orange-500 to-orange-600' : isCompleted ? 'from-orange-400 to-orange-500' : 'from-gray-600 to-gray-700',
      pink: isActive ? 'from-pink-500 to-pink-600' : isCompleted ? 'from-pink-400 to-pink-500' : 'from-gray-600 to-gray-700'
    };
    return colorMap[color as keyof typeof colorMap] || 'from-gray-600 to-gray-700';
  };

  return (
    <Card className="bg-black/20 backdrop-blur-xl border-white/20 shadow-2xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Research Progress</h3>
          <Badge variant="outline" className="border-primary/30 text-primary">
            Step {currentStepIndex + 1} of {steps.length}
          </Badge>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = step.id === activeTab;
            const isCompleted = step.completed;
            const isPast = index < currentStepIndex;
            const isFuture = index > currentStepIndex;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                  isActive ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5'
                }`}
                onClick={() => onTabChange(step.id)}
              >
                {/* Step Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r ${getColorClasses(step.color, isActive, isCompleted)} flex items-center justify-center shadow-lg`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  ) : isActive ? (
                    <step.icon className="h-5 w-5 text-white" />
                  ) : (
                    <Circle className="h-5 w-5 text-white/70" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <div className={`font-medium ${isActive ? 'text-white' : 'text-white/80'}`}>
                    {step.title}
                  </div>
                  <div className={`text-sm ${isActive ? 'text-white/70' : 'text-white/50'}`}>
                    {step.description}
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex-shrink-0">
                  {isCompleted && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      ✓ Done
                    </Badge>
                  )}
                  {isActive && !isCompleted && (
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      In Progress
                    </Badge>
                  )}
                  {isFuture && (
                    <Badge variant="outline" className="border-white/20 text-white/50">
                      Pending
                    </Badge>
                  )}
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[33px] top-16 w-0.5 h-4 bg-gradient-to-b from-white/20 to-transparent" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm text-white/70 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="h-2 bg-gradient-to-r from-primary to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};