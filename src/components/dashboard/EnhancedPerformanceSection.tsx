
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedStatCard } from './EnhancedStatCard';
import { PerformanceChart } from './PerformanceChart';
import { 
  Activity,
  Clock,
  FileText, 
  Search, 
  BarChart3, 
  Fingerprint,
  Users,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

export const EnhancedPerformanceSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
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
    hidden: { opacity: 0, x: -30 },
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Section Header */}
      <motion.div 
        className="flex items-center justify-between"
        variants={headerVariants}
      >
        <div className="flex items-center gap-4">
          <motion.div 
            className="h-10 w-10 rounded-full bg-gradient-to-r from-neon-purple/30 to-neon-blue/30 flex items-center justify-center backdrop-blur-xl border border-white/20"
            whileHover={{ 
              scale: 1.1, 
              backgroundColor: "rgba(155, 135, 245, 0.4)",
              transition: { duration: 0.2 }
            }}
          >
            <Activity className="h-5 w-5 text-white" />
          </motion.div>
          
          <div>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent">
              Performance Overview
            </h2>
            <p className="text-white/60 text-sm">Track your content success metrics</p>
          </div>
        </div>
        
        <motion.div 
          className="flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-sm font-medium text-white/70"
          whileHover={{ 
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderColor: "rgba(255, 255, 255, 0.2)"
          }}
        >
          <Clock className="h-4 w-4 mr-2 text-neon-blue" />
          Last 7 days
        </motion.div>
      </motion.div>
      
      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <EnhancedStatCard 
            title="Total Projects" 
            value="12" 
            description="2 active workflows" 
            icon="FileText"
            trend={{ value: 33, positive: true }}
            gradient="from-blue-500/20 to-cyan-400/15"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <EnhancedStatCard 
            title="Keywords Analyzed" 
            value="284" 
            description="Last 30 days" 
            icon="Search"
            trend={{ value: 12, positive: true }}
            gradient="from-green-500/20 to-emerald-400/15"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <EnhancedStatCard 
            title="Average SEO Score" 
            value="78/100" 
            description="Across all content" 
            icon="BarChart3"
            trend={{ value: 5, positive: true }}
            gradient="from-purple-500/20 to-pink-400/15"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <EnhancedStatCard 
            title="Conversions" 
            value="5.4%" 
            description="From content links" 
            icon="Fingerprint"
            trend={{ value: 2, positive: false }}
            gradient="from-orange-500/20 to-red-400/15"
          />
        </motion.div>
      </motion.div>
      
      {/* Performance Chart */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-black/40 via-black/20 to-transparent backdrop-blur-2xl border border-white/10 shadow-2xl">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5" />
            <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>
          
          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 flex items-center justify-center backdrop-blur-xl border border-white/20">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Content Performance</h3>
              </div>
              
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-xs">
                  <div className="w-2 h-2 rounded-full bg-neon-blue" />
                  <span className="text-white/70">Views</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-xs">
                  <div className="w-2 h-2 rounded-full bg-neon-purple" />
                  <span className="text-white/70">Engagement</span>
                </div>
              </div>
            </div>
            
            <PerformanceChart />
          </div>
        </div>
      </motion.div>
      
      {/* Additional Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <EnhancedStatCard 
            title="Content Created" 
            value="37" 
            description="8 published this month" 
            icon="FileText"
            trend={{ value: 18, positive: true }}
            gradient="from-emerald-500/20 to-teal-400/15"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <EnhancedStatCard 
            title="Audience Growth" 
            value="14.2%" 
            description="New visitors" 
            icon="Users"
            trend={{ value: 3.5, positive: true }}
            gradient="from-violet-500/20 to-purple-400/15"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
