import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Search, 
  BarChart3, 
  Zap, 
  Settings, 
  Users,
  Target,
  Lightbulb,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface QuickActionsPanelProps {
  onAction: (action: string, data?: any) => void;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  onAction
}) => {
  const quickActions = [
    {
      id: 'keyword-research',
      title: 'Keyword Research',
      description: 'Find high-performing keywords for your content',
      icon: Search,
      action: 'navigate:/research/keyword-research',
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'content-builder',
      title: 'Create Content',
      description: 'Build optimized content step-by-step',
      icon: FileText,
      action: 'navigate:/content-builder',
      color: 'from-green-500/20 to-green-600/20',
      borderColor: 'border-green-500/30'
    },
    {
      id: 'content-strategy',
      title: 'Content Strategy',
      description: 'Analyze competitors and plan your strategy',
      icon: Target,
      action: 'navigate:/research/content-strategy',
      color: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/30'
    },
    {
      id: 'analytics',
      title: 'Performance Analytics',
      description: 'Track and optimize your content performance',
      icon: BarChart3,
      action: 'navigate:/analytics',
      color: 'from-orange-500/20 to-orange-600/20',
      borderColor: 'border-orange-500/30'
    },
    {
      id: 'repurposing',
      title: 'Content Repurposing',
      description: 'Transform content across different formats',
      icon: Zap,
      action: 'navigate:/content-repurposing',
      color: 'from-yellow-500/20 to-yellow-600/20',
      borderColor: 'border-yellow-500/30'
    },
    {
      id: 'solutions',
      title: 'Solutions Management',
      description: 'Manage your products and solutions',
      icon: Settings,
      action: 'navigate:/solutions',
      color: 'from-gray-500/20 to-gray-600/20',
      borderColor: 'border-gray-500/30'
    }
  ];

  const chatSuggestions = [
    "Help me create a content strategy for my business",
    "How do I improve my SEO rankings?",
    "What are the best keywords for my industry?",
    "Create a blog post outline about [topic]",
    "Analyze my competitor's content strategy",
    "How to repurpose my existing content?"
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Header */}
      <motion.div 
        variants={itemVariants}
        className="text-center space-y-4"
      >
        <motion.div
          className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/20 border border-primary/30"
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="h-8 w-8 text-primary" />
        </motion.div>
        
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Welcome to AI Assistant
          </h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            I'm here to help you with content creation, SEO optimization, keyword research, and strategic planning. What would you like to work on today?
          </p>
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`
                  cursor-pointer transition-all duration-200 border-white/20 
                  bg-gradient-to-br ${action.color} ${action.borderColor}
                  hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20
                  backdrop-blur-sm
                `}
                onClick={() => onAction(action.action)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`
                      flex h-10 w-10 items-center justify-center rounded-lg 
                      bg-gradient-to-br ${action.color} ${action.borderColor} border
                    `}>
                      <action.icon className="h-5 w-5 text-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1">{action.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                    
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Chat Suggestions */}
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Try asking me...
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {chatSuggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                onClick={() => onAction(`send:${suggestion}`)}
                className="
                  w-full h-auto p-3 text-left justify-start 
                  bg-gradient-to-r from-background/80 to-background/60 
                  border-white/20 hover:border-primary/40 
                  hover:from-primary/10 hover:to-primary/5
                  transition-all duration-200
                  backdrop-blur-sm
                "
              >
                <Lightbulb className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                <span className="text-sm text-left">{suggestion}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};