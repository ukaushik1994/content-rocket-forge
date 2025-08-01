import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Zap,
  RefreshCw,
  Settings
} from 'lucide-react';

interface StatusOverviewProps {
  totalProviders: number;
  connectedCount: number;
  errorCount: number;
  unconfiguredCount: number;
  onRefreshAll: () => void;
  onQuickSetup: () => void;
}

export const StatusOverview = ({
  totalProviders,
  connectedCount,
  errorCount,
  unconfiguredCount,
  onRefreshAll,
  onQuickSetup
}: StatusOverviewProps) => {
  const stats = [
    {
      label: 'Connected',
      value: connectedCount,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      label: 'Needs Setup',
      value: unconfiguredCount,
      icon: Settings,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      label: 'Issues',
      value: errorCount,
      icon: AlertTriangle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Status Cards */}
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`p-4 bg-glass border ${stat.borderColor} hover:shadow-lg transition-all duration-300`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}

      {/* Actions Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-4 bg-glass border-white/10 hover:shadow-lg transition-all duration-300">
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onQuickSetup}
              className="w-full justify-start h-8"
            >
              <Zap className="h-3 w-3 mr-2" />
              Quick Setup
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefreshAll}
              className="w-full justify-start h-8"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Refresh All
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};