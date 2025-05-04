
import React from 'react';
import { NavigateFunction } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, FileText, FileUp, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickActionsGridProps {
  navigate: NavigateFunction;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ navigate }) => {
  const actions = [
    {
      title: "Keyword Research",
      description: "Discover high-value keywords and group them into strategic clusters.",
      icon: <Search className="h-5 w-5 text-neon-blue" />,
      action: () => navigate('/content-builder'),
      buttonText: "Start Research",
      buttonIcon: <Search className="h-4 w-4" />,
      gradient: "from-neon-blue/20 to-neon-purple/10",
      delay: 0.1
    },
    {
      title: "Content Creation",
      description: "Generate optimized content with AI that ranks well on search engines.",
      icon: <FileText className="h-5 w-5 text-neon-purple" />,
      action: () => navigate('/content'),
      buttonText: "Create Content",
      buttonIcon: <FileText className="h-4 w-4" />,
      gradient: "from-neon-purple/20 to-neon-pink/10",
      delay: 0.2
    },
    {
      title: "Solution Upload",
      description: "Upload your products and services to include in generated content.",
      icon: <FileUp className="h-5 w-5 text-neon-pink" />,
      action: () => navigate('/solutions'),
      buttonText: "Upload Solutions",
      buttonIcon: <FileUp className="h-4 w-4" />,
      gradient: "from-neon-pink/20 to-neon-blue/10",
      delay: 0.3
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((action, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: action.delay }}
        >
          <Card className={`glass-panel bg-glass hover:shadow-neon transition-all duration-300 overflow-hidden group`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="flex items-center gap-3 text-gradient">
                {action.icon}
                <span>{action.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <p className="text-sm text-muted-foreground">
                {action.description}
              </p>
              <Button 
                variant="outline" 
                className="w-full justify-between group/btn border-white/10 hover:border-white/20 bg-background/20 backdrop-blur-sm hover:bg-background/30"
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
