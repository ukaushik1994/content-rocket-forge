import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Eye, Target, RefreshCcw, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="relative overflow-hidden rounded-3xl bg-background/90 backdrop-blur-md border border-border/10">
      <div className="relative z-10 p-8 lg:p-12">
        {/* Hero Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-transparent border border-border/20 mb-6"
        >
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Real-time Analytics Dashboard</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 mb-8"
        >
          <h1 className="text-5xl lg:text-6xl font-bold text-foreground">
            Analytics Hub
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
            <Card className="bg-background/90 backdrop-blur-md border-border/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-transparent border border-border/20">
                    <Eye className="w-5 h-5 text-muted-foreground" />
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

            <Card className="bg-background/90 backdrop-blur-md border-border/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-transparent border border-border/20">
                    <Target className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Content</p>
                    <p className="text-2xl font-bold text-foreground">{totalContent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/90 backdrop-blur-md border-border/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-transparent border border-border/20">
                    <TrendingUp className="w-5 h-5 text-muted-foreground" />
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
              className="bg-foreground text-background hover:bg-foreground/90"
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
              className="bg-transparent border-border/20 hover:bg-muted/20"
            >
              <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          )}
          {onExport && (
            <Button 
              variant="outline"
              onClick={onExport}
              className="bg-transparent border-border/20 hover:bg-muted/20"
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
