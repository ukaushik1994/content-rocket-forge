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
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI Strategy Engine</h2>
          <p className="text-muted-foreground mt-1">
            Generate custom content strategies using our advanced AI engine
          </p>
        </div>
        <Button
          onClick={() => setShowCustomCreator(true)}
          variant="outline"
          className="bg-background/50 border-border/50 hover:bg-muted/50"
        >
          <Settings className="w-4 h-4 mr-2" />
          Custom Strategy
        </Button>
      </div>

      <ContentStrategyEngine serpMetrics={serpMetrics} goals={goals} />
    </div>
  );
};
