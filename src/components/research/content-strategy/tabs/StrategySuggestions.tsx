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
export const StrategySuggestions = ({
  serpMetrics,
  goals
}: StrategySuggestionsProps) => {
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  return <div className="space-y-6">
      

      <ContentStrategyEngine serpMetrics={serpMetrics} goals={goals} />
    </div>;
};