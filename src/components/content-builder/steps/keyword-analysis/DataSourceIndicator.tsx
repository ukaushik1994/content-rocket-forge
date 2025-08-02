
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Database, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface DataSourceIndicatorProps {
  isRealData: boolean;
  isMockData?: boolean;
  className?: string;
}

export function DataSourceIndicator({ 
  isRealData, 
  isMockData = false,
  className = '' 
}: DataSourceIndicatorProps) {
  const getStatusInfo = () => {
    if (isRealData && !isMockData) {
      return {
        icon: CheckCircle,
        status: 'Live Data',
        description: 'Real-time SERP data from API',
        color: 'from-green-500/20 to-emerald-500/20',
        textColor: 'text-green-300',
        borderColor: 'border-green-500/30',
        bgColor: 'bg-green-500/10'
      };
    } else {
      return {
        icon: AlertTriangle,
        status: 'Demo Data',
        description: 'Sample data for demonstration',
        color: 'from-yellow-500/20 to-orange-500/20',
        textColor: 'text-yellow-300',
        borderColor: 'border-yellow-500/30',
        bgColor: 'bg-yellow-500/10'
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className={`border ${statusInfo.borderColor} ${statusInfo.bgColor} backdrop-blur-xl overflow-hidden relative`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${statusInfo.color} opacity-50`} />
        
        <div className="relative z-10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
                <StatusIcon className={`h-5 w-5 ${statusInfo.textColor}`} />
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${statusInfo.textColor}`}>
                    {statusInfo.status}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${isRealData && !isMockData ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
                </div>
                <p className="text-xs text-white/60 mt-1">
                  {statusInfo.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isRealData && !isMockData ? (
                <Wifi className={`h-4 w-4 ${statusInfo.textColor}`} />
              ) : (
                <WifiOff className={`h-4 w-4 ${statusInfo.textColor}`} />
              )}
              
              <Badge 
                variant="outline" 
                className={`${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor} text-xs`}
              >
                {isRealData && !isMockData ? 'API Connected' : 'Demo Mode'}
              </Badge>
            </div>
          </div>

          {!isRealData ? (
            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-xs text-red-300 flex items-center gap-2">
                <Database className="h-3 w-3" />
                SERP API key required for data analysis. Configure in Settings.
              </p>
            </div>
          ) : null}
        </div>
      </Card>
    </motion.div>
  );
}
