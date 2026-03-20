import React from 'react';
import { Badge } from '@/components/ui/badge';

interface FunnelStageBadgeProps {
  stage: string | null | undefined;
}

const FUNNEL_CONFIG: Record<string, { label: string; className: string }> = {
  tofu: { label: 'TOFU', className: 'bg-sky-500/15 text-sky-400 border-sky-500/20' },
  mofu: { label: 'MOFU', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  bofu: { label: 'BOFU', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
};

export const FunnelStageBadge: React.FC<FunnelStageBadgeProps> = ({ stage }) => {
  if (!stage || !FUNNEL_CONFIG[stage]) return null;
  const config = FUNNEL_CONFIG[stage];
  
  return (
    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 font-semibold ${config.className}`}>
      {config.label}
    </Badge>
  );
};