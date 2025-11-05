import { GlassCard } from '@/components/ui/GlassCard';
import { Zap, Shield, Star } from 'lucide-react';
import { CompetitorAutoFillPayload } from '@/types/competitor-intel';

interface CompetitiveDifferentiationCardProps {
  data: CompetitorAutoFillPayload;
}

export function CompetitiveDifferentiationCard({ data }: CompetitiveDifferentiationCardProps) {
  const hasData = data.unique_value_propositions?.length || 
                  data.competitive_moats?.length || 
                  data.key_differentiators?.length;

  if (!hasData) return null;

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-primary" />
        Competitive Differentiation
      </h3>
      <div className="space-y-4">
        {data.unique_value_propositions && data.unique_value_propositions.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Star className="w-3 h-3" />
              Unique Value Propositions
            </p>
            <ul className="space-y-1.5">
              {data.unique_value_propositions.map((uvp, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">●</span>
                  <span>{uvp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.competitive_moats && data.competitive_moats.length > 0 && (
          <div className="pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Competitive Moats
            </p>
            <ul className="space-y-1.5">
              {data.competitive_moats.map((moat, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">●</span>
                  <span>{moat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.key_differentiators && data.key_differentiators.length > 0 && (
          <div className="pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Key Differentiators
            </p>
            <ul className="space-y-1.5">
              {data.key_differentiators.map((diff, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">●</span>
                  <span>{diff}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
