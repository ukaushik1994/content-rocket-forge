
import React from 'react';
import { NavigateFunction } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  FileUp, 
  ArrowRight, 
  FileBarChart, 
  Settings, 
  Repeat, 
  CheckCircle,
  Users,
  Brain,
  Target,
  Zap,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

interface EnhancedQuickActionsProps {
  navigate: NavigateFunction;
}

export const EnhancedQuickActions: React.FC<EnhancedQuickActionsProps> = ({ navigate }) => {
  const actions = [
    {
      title: "AI Content Creation",
      description: "Generate high-quality, SEO-optimized content with advanced AI assistance.",
      icon: <Brain className="h-6 w-6" />,
      action: () => navigate('/content-builder'),
      buttonText: "Create Content",
      gradient: "from-neon-purple/20 to-neon-pink/15",
      iconBg: "from-neon-purple/30 to-neon-pink/20",
      glowColor: "neon-purple/30",
      category: "primary"
    },
    {
      title: "Content Drafts",
      description: "Access and manage your saved content drafts and works in progress.",
      icon: <FileText className="h-6 w-6" />,
      action: () => navigate('/drafts'),
      buttonText: "View Drafts",
      gradient: "from-blue-400/20 to-cyan-500/15",
      iconBg: "from-blue-400/30 to-cyan-500/20",
      glowColor: "blue-400/30",
      category: "content"
    },
    {
      title: "Content Repurposing",
      description: "Transform existing content into various formats for different platforms.",
      icon: <Repeat className="h-6 w-6" />,
      action: () => navigate('/content-repurposing'),
      buttonText: "Repurpose Content",
      gradient: "from-indigo-400/20 to-violet-500/15",
      iconBg: "from-indigo-400/30 to-violet-500/20",
      glowColor: "indigo-400/30",
      category: "content"
    },
    {
      title: "Content Approval",
      description: "Review and approve content before publishing to ensure quality standards.",
      icon: <CheckCircle className="h-6 w-6" />,
      action: () => navigate('/content-approval'),
      buttonText: "Review Content",
      gradient: "from-green-400/20 to-emerald-500/15",
      iconBg: "from-green-400/30 to-emerald-500/20",
      glowColor: "green-400/30",
      category: "workflow"
    },
    {
      title: "Analytics Dashboard",
      description: "Track performance metrics and optimize your content strategy with insights.",
      icon: <FileBarChart className="h-6 w-6" />,
      action: () => navigate('/analytics'),
      buttonText: "View Analytics",
      gradient: "from-amber-400/20 to-orange-500/15",
      iconBg: "from-amber-400/30 to-orange-500/20",
      glowColor: "amber-400/30",
      category: "analytics"
    },
    {
      title: "SEO Optimization",
      description: "Advanced SEO tools and recommendations to boost your content rankings.",
      icon: <Target className="h-6 w-6" />,
      action: () => navigate('/seo-tools'),
      buttonText: "SEO Tools",
      gradient: "from-rose-400/20 to-pink-500/15",
      iconBg: "from-rose-400/30 to-pink-500/20",
      glowColor: "rose-400/30",
      category: "tools"
    },
    {
      title: "Team Collaboration",
      description: "Collaborate with team members and manage content workflows efficiently.",
      icon: <Users className="h-6 w-6" />,
      action: () => navigate('/team'),
      buttonText: "Manage Team",
      gradient: "from-cyan-400/20 to-teal-500/15",
      iconBg: "from-cyan-400/30 to-teal-500/20",
      glowColor: "cyan-400/30",
      category: "workflow"
    },
    {
      title: "Content Templates",
      description: "Access pre-built templates and frameworks for faster content creation.",
      icon: <BookOpen className="h-6 w-6" />,
      action: () => navigate('/templates'),
      buttonText: "Browse Templates",
      gradient: "from-emerald-400/20 to-green-500/15",
      iconBg: "from-emerald-400/30 to-green-500/20",
      glowColor: "emerald-400/30",
      category: "tools"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6
      }
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {actions.map((action, index) => (
        <motion.div
          key={index}
          variants={cardVariants}
          whileHover={{ 
            y: -8, 
            scale: 1.02,
            transition: { duration: 0.2 } 
          }}
          whileTap={{ scale: 0.98 }}
          className="group h-full"
        >
          <Card className="h-full overflow-hidden bg-gradient-to-br from-black/40 via-black/20 to-transparent backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all duration-500 group-hover:shadow-2xl relative">
            {/* Animated background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-all duration-500`} />
            
            {/* Glow effect */}
            <motion.div 
              className={`absolute -inset-0.5 bg-gradient-to-r ${action.iconBg} rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-500`}
              initial={false}
              animate={{ opacity: [0, 0.2, 0] }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
            
            <CardHeader className="pb-4 relative z-10">
              <div className="mb-4 flex justify-between items-start">
                <motion.div 
                  className={`p-3 rounded-xl bg-gradient-to-br ${action.iconBg} backdrop-blur-xl border border-white/20 shadow-lg group-hover:shadow-xl group-hover:border-white/30 transition-all duration-300`}
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 5,
                    transition: { duration: 0.2 } 
                  }}
                >
                  <div className="text-white">
                    {action.icon}
                  </div>
                  
                  {/* Icon glow effect */}
                  <motion.div 
                    className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100"
                    animate={{ 
                      opacity: [0, 0.3, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatType: "loop", 
                      duration: 2,
                      ease: "easeInOut",
                      repeatDelay: 1
                    }}
                  />
                </motion.div>
              </div>
              
              <CardTitle className="text-lg font-semibold text-white group-hover:text-white/95 transition-colors leading-tight">
                {action.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4 relative z-10 pb-6">
              <p className="text-sm text-white/70 group-hover:text-white/80 leading-relaxed transition-colors">
                {action.description}
              </p>
              
              <Button 
                variant="outline" 
                className="w-full justify-between group/btn border-white/20 hover:border-white/30 bg-background/20 backdrop-blur-sm hover:bg-background/30 text-white hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-white/10"
                onClick={action.action}
              >
                <span className="font-medium">
                  {action.buttonText}
                </span>
                
                <motion.span 
                  className="text-white/70 group-hover/btn:text-white"
                  animate={{ x: [0, 2, 0] }}
                  transition={{ 
                    repeatType: "loop", 
                    repeat: Infinity, 
                    duration: 3,
                    ease: "easeInOut",
                    repeatDelay: 2
                  }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Button>
            </CardContent>
            
            {/* Floating particles effect */}
            <div className="absolute top-4 right-4 w-1 h-1 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <motion.div
                className="w-full h-full bg-white/50 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
