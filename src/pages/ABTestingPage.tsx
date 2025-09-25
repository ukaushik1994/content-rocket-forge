import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { ABTestDashboard } from '@/components/ab-testing/ABTestDashboard';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { Container } from '@/components/ui/Container';
import { motion } from 'framer-motion';
import { TestTube, TrendingUp, Users, Target } from 'lucide-react';

export const ABTestingPage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.1,
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 } 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      <AnimatedBackground intensity="medium" />
      
      <Navbar />
      
      <main className="relative z-10 pt-24 pb-8">
        <Container>
          <motion.div 
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Hero Header */}
            <motion.div 
              variants={itemVariants}
              className="text-center space-y-6 py-12"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm"
              >
                <TestTube className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">Experiment & Optimize</span>
              </motion.div>
              
              <h1 className="text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                A/B Testing Hub
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Create, manage, and analyze experiments to optimize your content performance with data-driven insights
              </p>
            </motion.div>

            {/* Key Features Grid */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              {[
                {
                  icon: TrendingUp,
                  title: "Performance Analytics",
                  description: "Track conversion rates and statistical significance",
                  color: "from-blue-500 to-cyan-400"
                },
                {
                  icon: Users,
                  title: "Audience Segmentation", 
                  description: "Target specific user groups with variant assignments",
                  color: "from-emerald-500 to-teal-400"
                },
                {
                  icon: Target,
                  title: "Goal Tracking",
                  description: "Monitor key metrics and business objectives",
                  color: "from-violet-500 to-purple-400"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="relative group"
                  whileHover={{ y: -5, scale: 1.02 }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/30 relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg inline-flex mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Main Dashboard */}
            <motion.div variants={itemVariants}>
              <ABTestDashboard />
            </motion.div>
          </motion.div>
        </Container>
      </main>
    </div>
  );
};