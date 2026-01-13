import { CampaignStrategy } from '@/types/campaign-types';
import { FileText, Clock, Target, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignStatCardsProps {
  strategy: CampaignStrategy;
  contentGenerated?: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  colorClass: string;
}

const StatCard = ({ icon, value, label, colorClass }: StatCardProps) => (
  <div className="group relative flex flex-col items-center justify-center p-5 rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm hover:border-border/60 hover:bg-card/80 transition-all duration-300 hover:shadow-md">
    <div className={cn(
      "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
      colorClass
    )}>
      {icon}
    </div>
    <p className="text-xl font-bold mb-0.5">{value}</p>
    <p className="text-xs text-muted-foreground font-medium">{label}</p>
  </div>
);

export const CampaignStatCards = ({ strategy, contentGenerated = 0 }: CampaignStatCardsProps) => {
  const totalPieces = strategy.contentMix.reduce((sum, item) => sum + item.count, 0);
  
  const timelineMap: Record<string, number> = {
    '1 week': 7,
    '2 weeks': 14,
    '4 weeks': 28,
    'ongoing': 0
  };
  const daysRemaining = timelineMap[strategy.timeline?.toLowerCase() || ''] || 0;
  
  // Calculate expected reach from metrics
  const expectedReach = strategy.expectedMetrics?.impressions?.max 
    ? `${strategy.expectedMetrics.impressions.max}K`
    : typeof strategy.strategyScore === 'number'
      ? `${strategy.strategyScore}%`
      : '—';

  // Get goal from expected engagement or default
  const goalLabel = strategy.expectedEngagement 
    ? strategy.expectedEngagement.charAt(0).toUpperCase() + strategy.expectedEngagement.slice(1)
    : 'Awareness';

  const stats: StatCardProps[] = [
    {
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      value: `${contentGenerated}/${totalPieces}`,
      label: 'Content',
      colorClass: 'bg-blue-500/10'
    },
    {
      icon: <Clock className="h-6 w-6 text-amber-600" />,
      value: daysRemaining > 0 ? `${daysRemaining}d` : '∞',
      label: 'Timeline',
      colorClass: 'bg-amber-500/10'
    },
    {
      icon: <Target className="h-6 w-6 text-purple-600" />,
      value: goalLabel,
      label: 'Goal',
      colorClass: 'bg-purple-500/10'
    },
    {
      icon: <Users className="h-6 w-6 text-green-600" />,
      value: strategy.targetAudience?.split(' ')[0] || 'All',
      label: 'Audience',
      colorClass: 'bg-green-500/10'
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-cyan-600" />,
      value: expectedReach,
      label: 'Reach',
      colorClass: 'bg-cyan-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};
