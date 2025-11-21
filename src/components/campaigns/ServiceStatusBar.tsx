import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type ServiceStatus = 
  | { type: 'idle' }
  | { type: 'serp-analyzing'; message: string }
  | { type: 'serp-complete'; message: string }
  | { type: 'serp-error'; message: string }
  | { type: 'ai-generating'; provider: string; message: string }
  | { type: 'ai-complete'; count: number; message: string }
  | { type: 'ai-error'; message: string };

interface ServiceStatusBarProps {
  status: ServiceStatus;
}

export function ServiceStatusBar({ status }: ServiceStatusBarProps) {
  if (status.type === 'idle') return null;

  const getStatusConfig = () => {
    switch (status.type) {
      case 'serp-analyzing':
        return {
          icon: Search,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          label: 'Analyzing Search Trends',
          animate: true
        };
      case 'serp-complete':
        return {
          icon: CheckCircle2,
          iconColor: 'text-emerald-500',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/20',
          label: 'Search Analysis Complete',
          animate: false
        };
      case 'serp-error':
        return {
          icon: AlertCircle,
          iconColor: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/20',
          label: 'Search Data Unavailable',
          animate: false
        };
      case 'ai-generating':
        return {
          icon: Sparkles,
          iconColor: 'text-purple-500',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/20',
          label: `Generating with ${status.provider}`,
          animate: true
        };
      case 'ai-complete':
        return {
          icon: CheckCircle2,
          iconColor: 'text-emerald-500',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/20',
          label: 'Generation Complete',
          animate: false
        };
      case 'ai-error':
        return {
          icon: AlertCircle,
          iconColor: 'text-destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/20',
          label: 'Generation Error',
          animate: false
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status.type}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-3 p-3 rounded-lg border ${config.bgColor} ${config.borderColor} backdrop-blur-sm`}
      >
        <motion.div
          animate={config.animate ? { rotate: 360 } : {}}
          transition={config.animate ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
        >
          <StatusIcon className={`w-5 h-5 ${config.iconColor}`} />
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {config.label}
            </span>
            {config.animate && (
              <Badge variant="secondary" className="text-xs animate-pulse">
                Processing...
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {'message' in status ? status.message : ''}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
