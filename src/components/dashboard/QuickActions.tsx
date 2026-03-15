

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Eye, 
   
  Brain, 
  Swords, 
  BarChart3,
  
  ArrowRight,
  Zap,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TourTrigger } from '@/components/tour/TourTrigger';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
  gradient: string;
  iconGradient: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'create-strategy',
    title: 'Create New Strategy',
    description: 'Start a new content strategy with AI guidance',
    icon: Target,
    route: '/research/content-strategy',
    gradient: 'from-neon-blue/10 via-neon-blue/5 to-transparent',
    iconGradient: 'from-neon-blue to-cyan-400'
  },
  {
    id: 'content-builder',
    title: 'Content Builder',
    description: 'Create and optimize content with AI assistance',
    icon: Brain,
    route: '/content-builder',
    gradient: 'from-orange-500/10 via-orange-500/5 to-transparent',
    iconGradient: 'from-orange-400 to-yellow-400'
  },
  {
    id: 'competitor-insights',
    title: 'Competitor Insights',
    description: 'Track and analyze competitor content strategies',
    icon: Swords,
    route: '/research/competitor-analysis',
    gradient: 'from-red-500/10 via-red-500/5 to-transparent',
    iconGradient: 'from-red-400 to-pink-400'
  },
  {
    id: 'performance-review',
    title: 'Performance Review',
    description: 'Analyze content performance and ROI metrics',
    icon: BarChart3,
    route: '/analytics',
    gradient: 'from-neon-pink/10 via-neon-pink/5 to-transparent',
    iconGradient: 'from-neon-pink to-pink-400'
  }
];

export const QuickActions = () => {
  const navigate = useNavigate();

  const handleActionClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="w-full space-y-8 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div 
          className="absolute top-[10%] left-[20%] w-[300px] h-[300px] rounded-full bg-gradient-to-r from-neon-blue/20 via-neon-purple/15 to-transparent blur-[100px]"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-[20%] right-[15%] w-[250px] h-[250px] rounded-full bg-gradient-to-l from-neon-pink/15 via-neon-purple/10 to-transparent blur-[80px]"
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 5
          }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
          Quick Actions
        </h2>
          <TourTrigger variant="inline" size="sm" />
      </div>
      
      {/* Actions Grid - Bigger tiles with better spacing */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.1, 
              duration: 0.6,
              type: "spring",
              stiffness: 100,
              damping: 20
            }}
            whileHover={{ 
              scale: 1.02, 
              y: -8,
              transition: { type: "spring", stiffness: 400, damping: 30 }
            }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Card 
              className="glass-panel border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 cursor-pointer group overflow-hidden relative h-full w-full min-h-[280px]"
              onClick={() => handleActionClick(action.route)}
            >
              {/* Hover gradient overlay */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                initial={false}
              />
              
              {/* Animated border effect */}
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className={`absolute inset-0 bg-gradient-to-r ${action.iconGradient} opacity-20 blur-xl`} />
              </div>

              <CardContent className="p-10 relative z-10 h-full flex flex-col w-full">
                <div className="flex flex-col items-start space-y-8 flex-1 w-full">
                  {/* Icon - Much larger */}
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-all duration-300 relative overflow-hidden">
                      {/* Icon background glow */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${action.iconGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                      
                      <action.icon className={`w-12 h-12 text-white/70 group-hover:text-white transition-all duration-300 relative z-10`} />
                    </div>
                  </motion.div>
                  
                  {/* Content - Better spacing */}
                  <div className="space-y-4 flex-1 w-full">
                    <h3 className="font-bold text-2xl text-white/90 group-hover:text-white transition-colors duration-300 leading-tight">
                      {action.title}
                    </h3>
                    <p className="text-white/60 group-hover:text-white/80 leading-relaxed transition-colors duration-300 flex-1 text-lg">
                      {action.description}
                    </p>
                  </div>
                  
                  {/* Action Button - Larger and more prominent */}
                  <motion.div
                    className="w-full"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between text-white/80 hover:text-white hover:bg-white/10 p-4 h-auto font-medium text-lg group/btn"
                    >
                      <span>Get Started</span>
                      <motion.div
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      >
                        <ArrowRight className="w-6 h-6 group-hover/btn:text-white transition-colors" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

