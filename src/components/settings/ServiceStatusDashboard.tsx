import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, XCircle, Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface ServiceStatusDashboardProps {
  totalProviders: number;
  activeProviders: number;
  errorProviders: number;
  isServiceEnabled: boolean;
  onRefreshAll: () => void;
  onToggleService: (enabled: boolean) => void;
}

export function ServiceStatusDashboard({
  totalProviders,
  activeProviders,
  errorProviders,
  isServiceEnabled,
  onRefreshAll,
  onToggleService
}: ServiceStatusDashboardProps) {
  const healthScore = totalProviders > 0 ? Math.round((activeProviders / totalProviders) * 100) : 0;
  const warningProviders = totalProviders - activeProviders - errorProviders;

  const getHealthColor = () => {
    if (healthScore >= 80) return 'text-success';
    if (healthScore >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getHealthBadge = () => {
    if (!isServiceEnabled) {
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          <XCircle className="h-3 w-3 mr-1" />
          Service Disabled
        </Badge>
      );
    }
    
    if (totalProviders === 0) {
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
          <AlertCircle className="h-3 w-3 mr-1" />
          No Providers
        </Badge>
      );
    }

    if (healthScore >= 80) {
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
          <CheckCircle className="h-3 w-3 mr-1" />
          Excellent
        </Badge>
      );
    }

    if (healthScore >= 50) {
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
          <AlertCircle className="h-3 w-3 mr-1" />
          Needs Attention
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
        <XCircle className="h-3 w-3 mr-1" />
        Critical Issues
      </Badge>
    );
  };

  return (
    <Card className="border-0 bg-gradient-to-r from-primary/5 via-background to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            AI Service Status
          </div>
          {getHealthBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Health Score */}
        <div className="text-center">
          <motion.div 
            className={`text-4xl font-bold ${getHealthColor()}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            {healthScore}%
          </motion.div>
          <p className="text-sm text-muted-foreground">System Health</p>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div className="text-2xl font-semibold text-success">{activeProviders}</div>
            <p className="text-xs text-muted-foreground">Working</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-warning" />
            </div>
            <div className="text-2xl font-semibold text-warning">{warningProviders}</div>
            <p className="text-xs text-muted-foreground">Warning</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div className="text-2xl font-semibold text-destructive">{errorProviders}</div>
            <p className="text-xs text-muted-foreground">Error</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefreshAll}
            className="flex-1"
          >
            <Activity className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
          <Button 
            variant={isServiceEnabled ? "outline" : "default"}
            size="sm" 
            onClick={() => onToggleService(!isServiceEnabled)}
            className="flex-1"
          >
            {isServiceEnabled ? 'Disable Service' : 'Enable Service'}
          </Button>
        </div>

        {/* Service Description */}
        <div className="text-xs text-muted-foreground space-y-1">
          {isServiceEnabled ? (
            <>
              <p>• AI features are enabled with automatic provider fallback</p>
              <p>• System will use the highest priority working provider</p>
              <p>• Failed requests automatically try the next available provider</p>
            </>
          ) : (
            <p>• All AI features are disabled regardless of provider configuration</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}