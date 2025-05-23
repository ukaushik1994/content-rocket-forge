
import React, { useState, useEffect } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  FileText,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ApprovalDashboardProps {
  contentItems: ContentItemType[];
  onFilterChange: (status: string) => void;
  selectedFilter: string;
}

interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  needsChanges: number;
  inReview: number;
  avgApprovalTime: number;
  approvalRate: number;
}

export const ApprovalDashboard: React.FC<ApprovalDashboardProps> = ({
  contentItems,
  onFilterChange,
  selectedFilter
}) => {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    needsChanges: 0,
    inReview: 0,
    avgApprovalTime: 0,
    approvalRate: 0
  });

  useEffect(() => {
    const calculateStats = () => {
      const total = contentItems.length;
      const pending = contentItems.filter(item => item.approval_status === 'pending_review').length;
      const approved = contentItems.filter(item => item.approval_status === 'approved').length;
      const rejected = contentItems.filter(item => item.approval_status === 'rejected').length;
      const needsChanges = contentItems.filter(item => item.approval_status === 'needs_changes').length;
      const inReview = contentItems.filter(item => item.approval_status === 'in_review').length;
      
      // Calculate approval rate
      const totalReviewed = approved + rejected + needsChanges;
      const approvalRate = totalReviewed > 0 ? (approved / totalReviewed) * 100 : 0;
      
      // Calculate average approval time (mock data for now)
      const avgApprovalTime = 2.5; // days

      setStats({
        total,
        pending,
        approved,
        rejected,
        needsChanges,
        inReview,
        avgApprovalTime,
        approvalRate
      });
    };

    calculateStats();
  }, [contentItems]);

  const statCards = [
    {
      title: 'Pending Review',
      value: stats.pending,
      icon: Clock,
      color: 'purple',
      filter: 'pending_review',
      description: 'Awaiting review'
    },
    {
      title: 'In Review',
      value: stats.inReview,
      icon: FileText,
      color: 'blue',
      filter: 'in_review',
      description: 'Currently reviewing'
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      color: 'green',
      filter: 'approved',
      description: 'Ready to publish'
    },
    {
      title: 'Needs Changes',
      value: stats.needsChanges,
      icon: AlertTriangle,
      color: 'yellow',
      filter: 'needs_changes',
      description: 'Requires updates'
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      color: 'red',
      filter: 'rejected',
      description: 'Not approved'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.purple;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gradient mb-2">Content Approval Dashboard</h1>
            <p className="text-white/70">Manage and review content submissions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{stats.approvalRate.toFixed(1)}%</div>
              <div className="text-xs text-white/60">Approval Rate</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{stats.avgApprovalTime}</div>
              <div className="text-xs text-white/60">Avg. Days</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.filter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 hover:scale-105 border ${
                  selectedFilter === stat.filter 
                    ? getColorClasses(stat.color)
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
                onClick={() => onFilterChange(stat.filter)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`h-5 w-5 ${
                      selectedFilter === stat.filter 
                        ? '' 
                        : 'text-white/60'
                    }`} />
                    <Badge 
                      variant="secondary" 
                      className={`${
                        selectedFilter === stat.filter 
                          ? 'bg-white/20 text-white' 
                          : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {stat.value}
                    </Badge>
                  </div>
                  <h3 className={`font-medium text-sm ${
                    selectedFilter === stat.filter 
                      ? 'text-white' 
                      : 'text-white/80'
                  }`}>
                    {stat.title}
                  </h3>
                  <p className={`text-xs ${
                    selectedFilter === stat.filter 
                      ? 'text-white/80' 
                      : 'text-white/50'
                  }`}>
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-neon-purple" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">This Week</span>
                <span className="text-white/80">{stats.approved} approved</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Avg. Review Time</span>
                <span className="text-white/80">{stats.avgApprovalTime} days</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Success Rate</span>
                <span className="text-green-400">{stats.approvalRate.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neon-blue" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-white/70">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span>3 items approved today</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <span>2 items need changes</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span>5 items pending review</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
              <Users className="h-4 w-4 text-neon-pink" />
              Team Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/60">Total Content</span>
                <span className="text-white/80">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Active Reviews</span>
                <span className="text-white/80">{stats.inReview}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Queue Length</span>
                <span className="text-white/80">{stats.pending}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
