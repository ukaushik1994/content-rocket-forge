

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Eye, 
  Book, 
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
    id: 'view-opportunities',
    title: 'View Opportunities',
    description: 'Discover new content opportunities and gaps',
    icon: Eye,
    route: '/research/opportunities',
    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    iconGradient: 'from-emerald-400 to-green-400'
  },
  {
    id: 'glossary-builder',
    title: 'Glossary Builder',
    description: 'Build comprehensive glossaries for your industry',
    icon: Book,
    route: '/glossary-builder',
    gradient: 'from-neon-purple/10 via-neon-purple/5 to-transparent',
    iconGradient: 'from-neon-purple to-purple-400'
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
        <h2 className="text-4xl font-display font-semibold bg-gradient-to-r from-white via-white/95 to-white/85 bg-clip-text text-transparent tracking-tight">
          Quick Actions
        </h2>
        <TourTrigger variant="inline" size="sm" />
      </div>
      
      {/* Actions Grid - Premium spacing and layout */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.12, 
              duration: 0.7,
              type: "spring",
              stiffness: 120,
              damping: 25
            }}
            whileHover={{ 
              scale: 1.025, 
              y: -12,
              transition: { type: "spring", stiffness: 400, damping: 30 }
            }}
            whileTap={{ scale: 0.975 }}
            className="w-full"
          >
            <Card 
              className="glass-panel border-white/10 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.08] transition-all duration-500 cursor-pointer group overflow-hidden relative h-full w-full min-h-[320px] shadow-glass hover:shadow-glass-lg"
              onClick={() => handleActionClick(action.route)}
            >
              {/* Hover gradient overlay */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                initial={false}
              />
              
              {/* Enhanced border glow effect */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className={`absolute inset-0 bg-gradient-to-r ${action.iconGradient} opacity-10 blur-2xl`} />
                <div className="absolute inset-[1px] rounded-xl bg-gradient-to-b from-white/[0.08] to-transparent" />
              </div>

              <CardContent className="p-8 relative z-10 h-full flex flex-col w-full">
                <div className="flex flex-col items-start space-y-8 flex-1 w-full">
                  {/* Enhanced Icon */}
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.1, rotate: 3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-all duration-500 relative overflow-hidden shadow-premium">
                      {/* Enhanced icon background glow */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${action.iconGradient} opacity-0 group-hover:opacity-25 transition-opacity duration-700`} />
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50" />
                      
                      <action.icon className={`w-10 h-10 text-white/70 group-hover:text-white transition-all duration-500 relative z-10 drop-shadow-sm`} />
                    </div>
                  </motion.div>
                  
                  {/* Enhanced Content */}
                  <div className="space-y-4 flex-1 w-full">
                    <h3 className="font-display font-semibold text-2xl text-white/90 group-hover:text-white transition-colors duration-500 leading-tight tracking-tight">
                      {action.title}
                    </h3>
                    <p className="text-white/60 group-hover:text-white/80 leading-relaxed transition-colors duration-500 flex-1 text-base font-medium">
                      {action.description}
                    </p>
                  </div>
                  
                  {/* Premium Action Button */}
                  <motion.div
                    className="w-full"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <Button 
                      variant="glass"
                      className="w-full justify-between text-white/80 hover:text-white p-4 h-auto font-medium text-base group/btn shadow-premium hover:shadow-premium-lg"
                    >
                      <span>Get Started</span>
                      <motion.div
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      >
                        <ArrowRight className="w-5 h-5 group-hover/btn:text-white transition-colors duration-300" />
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

