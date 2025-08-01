
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Users, Calendar, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface StrategyDashboardProps {
  goals: any;
  serpMetrics: any;
}

export const StrategyDashboard = ({ goals, serpMetrics }: StrategyDashboardProps) => {
  const getGoalProgress = () => {
    const targetTraffic = parseInt(goals.monthlyTraffic) || 50000;
    const currentTraffic = serpMetrics ? Math.floor(serpMetrics.searchVolume * 0.1) : 2500;
    return Math.min((currentTraffic / targetTraffic) * 100, 100);
  };

  const getContentProgress = () => {
    const targetContent = parseInt(goals.contentPieces) || 8;
    const publishedContent = 3; // Mock data
    return (publishedContent / targetContent) * 100;
  };

  const metrics = [
    {
      title: "Monthly Traffic Goal",
      current: serpMetrics ? Math.floor(serpMetrics.searchVolume * 0.1).toLocaleString() : '2,500',
      target: parseInt(goals.monthlyTraffic || '50000').toLocaleString(),
      progress: getGoalProgress(),
      trend: 'up',
      change: '+12%',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: "Content Production",
      current: '3',
      target: goals.contentPieces || '8',
      progress: getContentProgress(),
      trend: 'up',
      change: '+25%',
      icon: Target,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: "Keyword Rankings",
      current: serpMetrics ? Math.floor(serpMetrics.keywordDifficulty * 0.4) : '12',
      target: '50',
      progress: serpMetrics ? (serpMetrics.keywordDifficulty * 0.4 / 50) * 100 : 24,
      trend: 'down',
      change: '-3%',
      icon: Users,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: "Timeline Progress",
      current: '1.2',
      target: goals.timeline?.split(' ')[0] || '3',
      progress: goals.timeline?.includes('month') ? 40 : 30,
      trend: 'neutral',
      change: '0%',
      icon: Calendar,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-400" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-400" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className="glass-panel border-white/10 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl backdrop-blur-sm border border-white/10">
            <TrendingUp className="h-6 w-6 text-blue-400" />
          </div>
          <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Strategy Performance Dashboard
          </span>
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            Live Data
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <Card className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.color} bg-opacity-20 backdrop-blur-sm border border-white/10`}>
                      <metric.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-300 mb-1">{metric.title}</div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {metric.current} / {metric.target}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">{Math.round(metric.progress)}%</span>
                      </div>
                      <Progress value={metric.progress} className="h-2 bg-gray-800" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Strategy Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-green-400">Strategy Wins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
                  <p className="text-sm text-white/80">Content production is 25% ahead of schedule</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
                  <p className="text-sm text-white/80">SERP visibility improved for target keywords</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
                  <p className="text-sm text-white/80">Traffic growth trending upward (+12% this month)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-yellow-400">Action Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2" />
                  <p className="text-sm text-white/80">Focus on improving keyword rankings for competitive terms</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2" />
                  <p className="text-sm text-white/80">Accelerate content production to meet monthly goals</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2" />
                  <p className="text-sm text-white/80">Optimize existing content for better performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
