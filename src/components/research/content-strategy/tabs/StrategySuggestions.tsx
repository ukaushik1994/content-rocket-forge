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
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-green-500/10 border border-white/10 p-6">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 blur-xl" />
        <div className="relative flex flex-col sm:flex-row gap-4 justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              AI Strategy Engine
            </h2>
            <p className="text-white/60">
              Generate custom content strategies using our advanced AI engine
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={() => setShowCustomCreator(true)}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white shadow-lg"
            >
              <Settings className="w-4 h-4 mr-2" />
              Custom Strategy
            </Button>
          </motion.div>
        </div>
      </div>

      <ContentStrategyEngine serpMetrics={serpMetrics} goals={goals} />
    </div>
  );
};
