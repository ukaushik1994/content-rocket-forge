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
  return;
}