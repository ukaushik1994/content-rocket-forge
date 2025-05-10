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
      action: () => navigate('/content-builder'),
      buttonText: "Create Content",
      buttonIcon: <ArrowRight className="h-4 w-4" />,
      gradient: "from-neon-purple/20 to-neon-pink/10",
      delay: 0.1,
      iconAnimation: {
        hover: { scale: 1.2, rotate: 5, transition: { duration: 0.3 } },
        tap: { scale: 0.9, transition: { duration: 0.1 } },
        initial: { opacity: 0, y: -15 },
        animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200 } }
      },
      iconBg: "bg-gradient-to-br from-neon-purple/30 to-neon-blue/20"
    },
    {
      title: "Solution Upload",
      description: "Upload your products and services to include in generated content.",
      icon: <FileUp className="h-5 w-5 text-neon-pink" />,
      action: () => navigate('/solutions'),
      buttonText: "Manage Solutions",
      buttonIcon: <ArrowRight className="h-4 w-4" />,
      gradient: "from-neon-pink/20 to-neon-blue/10",
      delay: 0.2,
      iconAnimation: {
        hover: { scale: 1.2, y: -5, transition: { duration: 0.3 } },
        tap: { scale: 0.9, transition: { duration: 0.1 } },
        initial: { opacity: 0, y: -15 },
        animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, delay: 0.1 } }
      },
      iconBg: "bg-gradient-to-br from-neon-pink/30 to-neon-blue/20"
    },
    {
      title: "Analytics Overview",
      description: "Track performance metrics and optimize your content strategy.",
      icon: <FileBarChart className="h-5 w-5 text-green-400" />,
      action: () => navigate('/analytics'),
      buttonText: "View Analytics",
      buttonIcon: <ArrowRight className="h-4 w-4" />,
      gradient: "from-green-400/20 to-emerald-500/10",
      delay: 0.3,
      iconAnimation: {
        hover: { scale: 1.2, rotate: -5, transition: { duration: 0.3 } },
        tap: { scale: 0.9, transition: { duration: 0.1 } },
        initial: { opacity: 0, y: -15 },
        animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, delay: 0.2 } }
      },
      iconBg: "bg-gradient-to-br from-green-400/30 to-emerald-500/20"
    },
    {
      title: "Configure Settings",
      description: "Customize your workflow and API integrations for optimal results.",
      icon: <Settings className="h-5 w-5 text-amber-400" />,
      action: () => navigate('/settings'),
      buttonText: "Open Settings",
      buttonIcon: <ArrowRight className="h-4 w-4" />,
      gradient: "from-amber-400/20 to-orange-500/10",
      delay: 0.4,
      iconAnimation: {
        hover: { rotate: 90, scale: 1.2, transition: { duration: 0.5 } },
        tap: { scale: 0.9, transition: { duration: 0.1 } },
        initial: { opacity: 0, y: -15 },
        animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, delay: 0.3 } }
      },
      iconBg: "bg-gradient-to-br from-amber-400/30 to-orange-500/20"
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
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="group"
        >
          <Card className={`glass-panel bg-glass overflow-hidden group relative h-full border-white/5 hover:border-white/10`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
            <CardHeader className="pb-2 relative z-10">
              <motion.div 
                className="mb-2 flex justify-between items-start"
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
              >
                <motion.div 
                  className={`p-2.5 rounded-lg ${action.iconBg} backdrop-blur-md border border-white/10 shadow-lg`}
                  variants={action.iconAnimation}
                >
                  {action.icon}
                  <motion.div 
                    className="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100"
                    animate={{ 
                      opacity: [0, 0.5, 0],
                      scale: [1, 1.35, 1]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatType: "loop", 
                      duration: 3,
                      ease: "easeInOut",
                      repeatDelay: 1
                    }}
                  />
                </motion.div>
              </motion.div>
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
                <motion.span 
                  className="transform transition-transform group-hover/btn:translate-x-1"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ 
                    repeatType: "loop", 
                    repeat: Infinity, 
                    duration: 2.5,
                    ease: "easeInOut",
                    repeatDelay: 2
                  }}
                >
                  {action.buttonIcon}
                </motion.span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
