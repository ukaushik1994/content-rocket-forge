import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, FileSearch, Users, BarChart3, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface FloatingResearchActionsProps {
  onTabChange: (tab: string) => void;
  activeTab: string;
}

export const FloatingResearchActions: React.FC<FloatingResearchActionsProps> = ({ onTabChange, activeTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'keyword-intelligence',
      label: 'Keywords',
      icon: Search,
      color: 'from-blue-500 to-blue-600',
      description: 'Analyze keywords'
    },
    {
      id: 'content-gaps',
      label: 'Content Gaps',
      icon: FileSearch,
      color: 'from-purple-500 to-purple-600',
      description: 'Find opportunities'
    },
    {
      id: 'people-questions',
      label: 'Questions',
      icon: Users,
      color: 'from-green-500 to-green-600',
      description: 'Audience insights'
    },
    {
      id: 'research-insights',
      label: 'Insights',
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600',
      description: 'Analytics overview'
    },
    {
      id: 'content-builder',
      label: 'Create Content',
      icon: Target,
      color: 'from-pink-500 to-pink-600',
      description: 'Start building'
    }
  ];

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'content-builder') {
      navigate('/content-builder');
      toast.success('🚀 Opening Content Builder');
    } else {
      onTabChange(actionId);
      toast.info(`Switched to ${quickActions.find(a => a.id === actionId)?.label}`);
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mb-4"
          >
            <Card className="bg-black/40 backdrop-blur-2xl border-white/20 shadow-2xl">
              <CardContent className="p-4 space-y-2">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickAction(action.id)}
                      className={`w-full justify-start gap-3 hover:bg-white/10 transition-all duration-200 ${
                        activeTab === action.id ? 'bg-gradient-to-r ' + action.color + ' text-white' : 'text-white/80'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg bg-gradient-to-r ${action.color} shadow-sm`}>
                        <action.icon className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">{action.label}</span>
                        <span className="text-xs opacity-70">{action.description}</span>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-2xl transition-all duration-300 ${
            isOpen ? 'rotate-45' : ''
          }`}
        >
          {isOpen ? (
            <Plus className="h-6 w-6 text-white" />
          ) : (
            <Sparkles className="h-6 w-6 text-white" />
          )}
        </Button>
      </motion.div>
    </div>
  );
};