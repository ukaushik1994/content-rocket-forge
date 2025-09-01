import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { TrendingUp, Settings } from 'lucide-react';
import { CustomStrategyCreator } from '../CustomStrategyCreator';
import { StrategyComparison } from '../StrategyComparison';
import { ContentStrategyEngine } from '../ContentStrategyEngine';

interface StrategySuggestionsProps {
  serpMetrics: any;
  goals: any;
}

export const StrategySuggestions = ({ serpMetrics, goals }: StrategySuggestionsProps) => {
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [showComparison, setShowComparison] = useState(false);


  return (
    <div className="space-y-8">
      {/* Enhanced Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl glass-card border border-white/20 p-8 shadow-2xl"
      >
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-blue-500/8 to-purple-500/10" />
          <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-radial from-primary/20 to-transparent rounded-full filter blur-2xl animate-pulse-glow" />
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-radial from-blue-500/20 to-transparent rounded-full filter blur-2xl animate-float" />
        </div>
        
        <div className="relative flex flex-col lg:flex-row gap-6 justify-between items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-4 flex-1"
          >
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4, type: "spring" }}
                className="p-3 rounded-xl glass-panel border border-white/20"
              >
                <TrendingUp className="h-6 w-6 text-primary" />
              </motion.div>
              <h2 className="text-3xl font-bold text-holographic">
                AI Strategy Engine
              </h2>
            </div>
            <p className="text-white/80 text-lg leading-relaxed">
              Generate data-driven content strategies using our advanced AI engine with SERP analysis, 
              competitor research, and performance forecasting.
            </p>
            <div className="flex flex-wrap gap-2">
              {['SERP Analysis', 'AI Optimization', 'Performance Tracking'].map((feature, index) => (
                <motion.span
                  key={feature}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="px-3 py-1 text-xs rounded-full glass-panel border border-primary/30 text-primary"
                >
                  {feature}
                </motion.span>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col gap-3"
          >
            <Button
              onClick={() => setShowCustomCreator(true)}
              variant="outline"
              size="lg"
              className="glass-panel border-white/30 text-white hover:bg-white/20 hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Settings className="w-5 h-5 mr-2" />
              Custom Strategy Builder
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Content Strategy Engine */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <ContentStrategyEngine serpMetrics={serpMetrics} goals={goals} />
      </motion.div>

      {/* Custom Creator Modal */}
      {showCustomCreator && (
        <CustomStrategyCreator 
          onClose={() => setShowCustomCreator(false)} 
          goals={goals}
        />
      )}
      
      {/* Strategy Comparison Modal */}
      {showComparison && (
        <StrategyComparison 
          strategies={[]} // Pass empty array for now - can be populated with actual strategies later
          onClose={() => setShowComparison(false)}
          onSelectStrategy={(strategy) => {
            // Handle strategy selection
            console.log('Selected strategy:', strategy);
            setShowComparison(false);
          }}
        />
      )}
    </div>
  );
};
