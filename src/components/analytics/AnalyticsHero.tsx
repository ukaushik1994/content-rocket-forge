import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Eye, Target, Zap, RefreshCcw, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface AnalyticsHeroProps {
  loading?: boolean;
  hasData?: boolean;
  totalViews?: number;
  totalContent?: number;
  avgPerformance?: number;
  onRefresh?: () => void;
  onExport?: () => void;
  onConfigure?: () => void;
}

export const AnalyticsHero: React.FC<AnalyticsHeroProps> = ({
  loading = false,
  hasData = false,
  totalViews = 0,
  totalContent = 0,
  avgPerformance = 0,
  onRefresh,
  onExport,
  onConfigure
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10 border border-border/30 backdrop-blur-xl">
      {/* Animated background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-blue-500/20 to-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 p-8 lg:p-12">
        {/* Hero Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-blue-500/20 border border-primary/30 backdrop-blur-sm mb-6"
        >
          <div className="relative">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <div className="absolute inset-0 w-2 h-2 bg-primary rounded-full animate-ping" />
          </div>
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Real-time Analytics Dashboard</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 mb-8"
        >
          <h1 className="text-5xl lg:text-6xl font-bold">
            <span className="bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent">
              Analytics Hub
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Track performance, discover insights, and optimize your content strategy with powerful analytics
          </p>
        </motion.div>

        {/* Quick Stats - Only show if has data */}
        {hasData && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold text-foreground">
                      {totalViews > 1000000 
                        ? `${(totalViews / 1000000).toFixed(1)}M` 
                        : totalViews > 1000 
                        ? `${(totalViews / 1000).toFixed(1)}K` 
                        : totalViews.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Content</p>
                    <p className="text-2xl font-bold text-foreground">{totalContent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-400">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Performance</p>
                    <p className="text-2xl font-bold text-foreground">{avgPerformance}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-3"
        >
          {onConfigure && (
            <Button 
              onClick={onConfigure}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure Analytics
            </Button>
          )}
          {onRefresh && (
            <Button 
              variant="outline" 
              onClick={onRefresh}
              disabled={loading}
              className="bg-card/50 border-border/50 hover:bg-card/70"
            >
              <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          )}
          {onExport && (
            <Button 
              variant="outline"
              onClick={onExport}
              className="bg-card/50 border-border/50 hover:bg-card/70"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
};
