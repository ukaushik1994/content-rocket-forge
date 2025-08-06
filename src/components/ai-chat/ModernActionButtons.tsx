import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  FileText, 
  Search, 
  Target, 
  Sparkles, 
  ExternalLink,
  PenTool,
  BarChart3,
  Zap,
  TrendingUp
} from 'lucide-react';
import { ContextualAction } from '@/services/aiService';

interface ModernActionButtonsProps {
  actions: ContextualAction[];
  onAction: (action: string, data?: any) => void;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'create-blog-post':
    case 'create-article':
      return FileText;
    case 'create-landing-page':
    case 'create-sales-page':
      return PenTool;
    case 'keyword-research':
    case 'analyze-keywords':
      return Search;
    case 'seo-optimization':
    case 'optimize-content':
      return Target;
    case 'content-strategy':
    case 'create-strategy':
      return BarChart3;
    case 'competitor-analysis':
      return TrendingUp;
    default:
      return Sparkles;
  }
};

const getActionGradient = (index: number) => {
  const gradients = [
    'from-neon-purple to-neon-blue',
    'from-neon-blue to-purple-400',
    'from-purple-400 to-pink-400',
    'from-pink-400 to-neon-purple',
    'from-green-400 to-blue-500',
    'from-yellow-400 to-orange-500'
  ];
  return gradients[index % gradients.length];
};

export const ModernActionButtons: React.FC<ModernActionButtonsProps> = ({ 
  actions, 
  onAction 
}) => {
  const navigate = useNavigate();

  if (!actions || actions.length === 0) return null;

  const handleActionClick = (action: ContextualAction) => {
    console.log('🎯 Modern action clicked:', action);
    
    // Handle content creation actions with navigation
    if (action.action?.includes('create-') || action.action?.includes('content-') || action.action?.includes('blog-post')) {
      // Navigate to content builder with pre-filled data
      const preloadData = {
        mainKeyword: action.data?.keyword || action.data?.mainKeyword || action.label,
        selectedKeywords: action.data?.keywords || [],
        contentType: action.data?.contentType || 'blog-post',
        contentTitle: action.data?.title || action.label,
        location: action.data?.location,
        step: action.data?.step || 1,
        description: action.description,
        ...action.data
      };

      navigate('/content', { 
        state: { prefilledData: preloadData }
      });
    } else if (action.action?.includes('keyword-research') || action.action?.includes('research')) {
      // Navigate to research page with keyword
      navigate('/research', { 
        state: { 
          prefilledKeyword: action.data?.keyword || action.data?.mainKeyword || action.label 
        }
      });
    } else if (action.action?.includes('strategy')) {
      // Navigate to strategy page
      navigate('/strategies');
    } else {
      // Handle other actions through the normal flow
      onAction(action.action, action.data);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-gradient mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-neon-purple" />
          Smart Actions
        </h3>
        
        <div className="grid gap-4">
          {actions.map((action, index) => {
            const Icon = getActionIcon(action.action);
            const gradient = getActionGradient(index);
            
            return (
              <motion.div
                key={action.id}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                {action.type === 'card' ? (
                  <Card 
                    className="glass-card hover:shadow-lg hover:shadow-neon-purple/20 transition-all duration-300 cursor-pointer group border-white/10 overflow-hidden relative"
                    onClick={() => handleActionClick(action)}
                  >
                    {/* Animated gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    {/* Glowing border effect */}
                    <div className="absolute inset-0 rounded-lg border border-transparent bg-gradient-to-r from-white/20 to-white/5 group-hover:from-neon-purple/30 group-hover:to-neon-blue/30 transition-all duration-300" />
                    
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Icon with gradient background */}
                          <motion.div 
                            className={`p-3 rounded-xl bg-gradient-to-r ${gradient} bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300`}
                            whileHover={{ rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.3 }}
                          >
                            <Icon className="h-6 w-6 text-white" />
                          </motion.div>
                          
                          <div className="flex-1 space-y-3">
                            <h4 className="font-semibold text-white group-hover:text-gradient transition-all duration-300">
                              {action.label}
                            </h4>
                            
                            {action.description && (
                              <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                                {action.description}
                              </p>
                            )}
                            
                            {/* Data badges */}
                            {action.data && Object.keys(action.data).length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(action.data).slice(0, 3).map(([key, value]) => (
                                  <Badge 
                                    key={key} 
                                    variant="outline" 
                                    className="text-xs bg-white/5 border-white/20 text-white/80 group-hover:bg-white/10 group-hover:border-neon-purple/30 transition-all"
                                  >
                                    {key === 'keyword' || key === 'mainKeyword' ? (
                                      <span className="flex items-center gap-1">
                                        <Search className="h-3 w-3" />
                                        {String(value)}
                                      </span>
                                    ) : (
                                      String(value)
                                    )}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Action indicator */}
                        <motion.div
                          className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-all duration-300"
                          whileHover={{ x: 5 }}
                        >
                          <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-neon-purple transition-colors" />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-between text-left h-auto p-4 glass-card border-white/10 hover:border-neon-purple/30 group"
                    onClick={() => handleActionClick(action)}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className={`p-2 rounded-lg bg-gradient-to-r ${gradient} bg-opacity-20`}
                        whileHover={{ scale: 1.1 }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </motion.div>
                      
                      <div className="text-left">
                        <div className="font-medium text-white group-hover:text-gradient transition-all">
                          {action.label}
                        </div>
                        {action.description && (
                          <div className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                            {action.description}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="text-white/60 group-hover:text-neon-purple transition-colors"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};