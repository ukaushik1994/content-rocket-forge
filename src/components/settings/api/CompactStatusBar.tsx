import React from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, AlertTriangle, XCircle, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompactStatusBarProps {
  totalProviders: number;
  connectedProviders: number;
  errorProviders: number;
  onRefresh: () => void;
  onQuickSetup: () => void;
}

export const CompactStatusBar: React.FC<CompactStatusBarProps> = ({
  totalProviders,
  connectedProviders,
  errorProviders,
  onRefresh,
  onQuickSetup
}) => {
  const unconfiguredProviders = totalProviders - connectedProviders - errorProviders;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between bg-glass backdrop-blur-sm rounded-xl p-4 border border-white/10 mb-6"
    >
      {/* Status Indicators */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium">
            {connectedProviders} Connected
          </span>
        </div>
        
        {errorProviders > 0 && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm font-medium text-red-400">
              {errorProviders} Issues
            </span>
          </div>
        )}
        
        {unconfiguredProviders > 0 && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-sm font-medium text-amber-400">
              {unconfiguredProviders} Pending
            </span>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center space-x-3">
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold text-gradient">
            {Math.round((connectedProviders / totalProviders) * 100)}%
          </div>
          <div className="text-xs text-muted-foreground">Complete</div>
        </div>
        
        <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-neon-purple to-neon-blue"
            initial={{ width: 0 }}
            animate={{ width: `${(connectedProviders / totalProviders) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="h-8 w-8 p-0"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onQuickSetup}
          className="h-8 px-3 border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Quick Setup
        </Button>
      </div>
    </motion.div>
  );
};