
import React from 'react';
import { NavigateFunction } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, FileUp, ArrowRight, FileBarChart, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickActionsGridProps {
  navigate: NavigateFunction;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ navigate }) => {
  const actions = [
    {
      title: "Content Creation",
      description: "Generate optimized content with AI that ranks well on search engines.",
      icon: <FileText className="h-5 w-5 text-neon-purple" />,
      action: () => navigate('/content'),
      buttonText: "Create Content",
      buttonIcon: <ArrowRight className="h-4 w-4" />,
      gradient: "from-neon-purple/20 to-neon-pink/10",
      delay: 0.1
    },
    {
      title: "Solution Upload",
      description: "Upload your products and services to include in generated content.",
      icon: <FileUp className="h-5 w-5 text-neon-pink" />,
      action: () => navigate('/solutions'),
      buttonText: "Manage Solutions",
      buttonIcon: <ArrowRight className="h-4 w-4" />,
      gradient: "from-neon-pink/20 to-neon-blue/10",
      delay: 0.2
    },
    {
      title: "Analytics Overview",
      description: "Track performance metrics and optimize your content strategy.",
      icon: <FileBarChart className="h-5 w-5 text-green-400" />,
      action: () => navigate('/analytics'),
      buttonText: "View Analytics",
      buttonIcon: <ArrowRight className="h-4 w-4" />,
      gradient: "from-green-400/20 to-emerald-500/10",
      delay: 0.3
    },
    {
      title: "Configure Settings",
      description: "Customize your workflow and API integrations for optimal results.",
      icon: <Settings className="h-5 w-5 text-amber-400" />,
      action: () => navigate('/settings'),
      buttonText: "Open Settings",
      buttonIcon: <ArrowRight className="h-4 w-4" />,
      gradient: "from-amber-400/20 to-orange-500/10",
      delay: 0.4
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: action.delay }}
        >
          <Card className={`glass-panel bg-glass overflow-hidden group relative h-full border-white/5 hover:border-white/10`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
            <CardHeader className="pb-2 relative z-10">
              <div className="mb-2 flex justify-between items-start">
                <div className="p-2 rounded-md bg-background/30 backdrop-blur-sm border border-white/5">
                  {action.icon}
                </div>
              </div>
              <CardTitle className="text-base text-gradient">
                {action.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <p className="text-xs text-muted-foreground">
                {action.description}
              </p>
              <Button 
                variant="outline" 
                className="w-full justify-between group/btn border-white/10 hover:border-white/20 bg-background/20 backdrop-blur-sm hover:bg-background/30 mt-auto text-sm"
                onClick={action.action}
              >
                <span>{action.buttonText}</span>
                <span className="transform transition-transform group-hover/btn:translate-x-1">
                  {action.buttonIcon}
                </span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
