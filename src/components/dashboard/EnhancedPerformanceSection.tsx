import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedStatCard } from './EnhancedStatCard';
import { PerformanceChart } from './PerformanceChart';
import { Activity, Clock, FileText, Search, BarChart3, Fingerprint, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
export const EnhancedPerformanceSection: React.FC = () => {
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };
  const headerVariants = {
    hidden: {
      opacity: 0,
      x: -30
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };
  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      {/* Section Header */}
      <motion.div 
        className="text-center space-y-4"
        variants={headerVariants}
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-neon-purple/30 to-neon-blue/30 flex items-center justify-center backdrop-blur-xl border border-white/10">
            <BarChart3 className="h-5 w-5 text-neon-purple" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
            Performance Insights
          </h2>
        </div>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Track your content performance and optimize your strategy with real-time analytics
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <EnhancedStatCard
            title="Total Content"
            value="24"
            trend={{ value: 12, positive: true }}
            icon="FileText"
            description="Published articles"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <EnhancedStatCard
            title="Search Volume"
            value="15.2K"
            trend={{ value: 8, positive: true }}
            icon="Search"
            description="Monthly searches"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <EnhancedStatCard
            title="Avg. Sessions"
            value="1,250"
            trend={{ value: 15, positive: true }}
            icon="Users"
            description="Weekly sessions"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <EnhancedStatCard
            title="Conversion Rate"
            value="3.2%"
            trend={{ value: 0.5, positive: true }}
            icon="TrendingUp"
            description="Goal completions"
          />
        </motion.div>
      </motion.div>

      {/* Performance Chart */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-neon-blue" />
              Content Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};