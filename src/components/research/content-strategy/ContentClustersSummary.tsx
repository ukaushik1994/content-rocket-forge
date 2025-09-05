import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Calendar, TrendingUp } from 'lucide-react';

interface ContentClustersSummaryProps {
  totalProposals: number;
  selectedCount: number;
  completedCount: number;
  estimatedTraffic: number;
}

export const ContentClustersSummary = ({
  totalProposals,
  selectedCount,
  completedCount,
  estimatedTraffic
}: ContentClustersSummaryProps) => {
  const activeProposals = totalProposals - completedCount;
  const completionRate = totalProposals > 0 ? Math.round((completedCount / totalProposals) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Active Clusters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{activeProposals}</div>
          <p className="text-xs text-white/60 mt-1">Ready for content creation</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{completedCount}</div>
          <p className="text-xs text-white/60 mt-1">{completionRate}% completion rate</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Selected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{selectedCount}</div>
          <p className="text-xs text-white/60 mt-1">Ready to schedule</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Traffic Potential
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{estimatedTraffic.toLocaleString()}</div>
          <p className="text-xs text-white/60 mt-1">Monthly impressions</p>
        </CardContent>
      </Card>
    </div>
  );
};