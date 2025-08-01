
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Eye, Share, MessageCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentPerformanceProps {
  goals: any;
}

export const ContentPerformance = ({ goals }: ContentPerformanceProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const contentPieces = [
    {
      id: 1,
      title: `Complete Guide to ${goals.mainKeyword || 'Content Marketing'}`,
      status: 'published',
      publishDate: '2025-01-10',
      views: 12450,
      shares: 89,
      comments: 23,
      ranking: 3,
      traffic: 2340,
      conversions: 45,
      performance: 85,
      trend: 'up'
    },
    {
      id: 2,
      title: `${goals.mainKeyword || 'Content Marketing'} Best Practices`,
      status: 'published',
      publishDate: '2025-01-05',
      views: 8920,
      shares: 56,
      comments: 18,
      ranking: 7,
      traffic: 1890,
      conversions: 32,
      performance: 72,
      trend: 'up'
    },
    {
      id: 3,
      title: `Advanced ${goals.mainKeyword || 'Content Marketing'} Strategies`,
      status: 'published',
      publishDate: '2025-01-01',
      views: 6780,
      shares: 34,
      comments: 12,
      ranking: 12,
      traffic: 1230,
      conversions: 19,
      performance: 58,
      trend: 'down'
    },
    {
      id: 4,
      title: `${goals.mainKeyword || 'Content Marketing'} Tools Review`,
      status: 'draft',
      publishDate: '2025-01-15',
      views: 0,
      shares: 0,
      comments: 0,
      ranking: null,
      traffic: 0,
      conversions: 0,
      performance: 0,
      trend: 'neutral'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'draft': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'review': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const periods = [
    { label: '7 days', value: '7d' },
    { label: '30 days', value: '30d' },
    { label: '90 days', value: '90d' }
  ];

  return (
    <Card className="glass-panel border-white/10 shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl backdrop-blur-sm border border-white/10">
              <BarChart3 className="h-6 w-6 text-purple-400" />
            </div>
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Content Performance
            </span>
          </CardTitle>
          <div className="flex gap-2">
            {periods.map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
                className="text-xs"
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Performance Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">
                {contentPieces.reduce((acc, item) => acc + item.views, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-300">Total Views</div>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
              <div className="text-2xl font-bold text-green-400">
                {contentPieces.reduce((acc, item) => acc + item.traffic, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-300">Organic Traffic</div>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-400">
                {contentPieces.reduce((acc, item) => acc + item.shares, 0)}
              </div>
              <div className="text-sm text-gray-300">Social Shares</div>
            </div>
            <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
              <div className="text-2xl font-bold text-orange-400">
                {contentPieces.reduce((acc, item) => acc + item.conversions, 0)}
              </div>
              <div className="text-sm text-gray-300">Conversions</div>
            </div>
          </div>

          {/* Content List */}
          <div className="space-y-4">
            {contentPieces.map((content, index) => (
              <motion.div
                key={content.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white text-lg">{content.title}</h4>
                      <Badge variant="outline" className={getStatusColor(content.status)}>
                        {content.status}
                      </Badge>
                      {content.ranking && (
                        <Badge variant="outline" className="text-blue-400 border-blue-400">
                          Rank #{content.ranking}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">Published: {content.publishDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`h-4 w-4 ${getTrendColor(content.trend)}`} />
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {content.status === 'published' && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Eye className="h-4 w-4 text-blue-400 mr-1" />
                        </div>
                        <div className="text-lg font-semibold text-white">{content.views.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Share className="h-4 w-4 text-green-400 mr-1" />
                        </div>
                        <div className="text-lg font-semibold text-white">{content.shares}</div>
                        <div className="text-xs text-gray-400">Shares</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <MessageCircle className="h-4 w-4 text-purple-400 mr-1" />
                        </div>
                        <div className="text-lg font-semibold text-white">{content.comments}</div>
                        <div className="text-xs text-gray-400">Comments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{content.traffic.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Traffic</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{content.conversions}</div>
                        <div className="text-xs text-gray-400">Conversions</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Performance Score</span>
                        <span className="text-white font-medium">{content.performance}%</span>
                      </div>
                      <Progress value={content.performance} className="h-2 bg-gray-800" />
                    </div>
                  </>
                )}

                {content.status === 'draft' && (
                  <div className="text-center py-4">
                    <p className="text-gray-400 mb-2">Content not yet published</p>
                    <Button size="sm" variant="outline">
                      Schedule Publication
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
