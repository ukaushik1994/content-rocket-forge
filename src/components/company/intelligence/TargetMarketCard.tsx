import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Target, Briefcase, Building, Lightbulb } from 'lucide-react';
import { CompetitorAutoFillPayload } from '@/types/competitor-intel';

interface TargetMarketCardProps {
  data: CompetitorAutoFillPayload;
}

export function TargetMarketCard({ data }: TargetMarketCardProps) {
  const hasData = data.target_industries?.length || data.target_company_size?.length || 
                  data.primary_use_cases?.length || data.ideal_customer_profile;

  if (!hasData) return null;

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        Target Market
      </h3>
      <div className="space-y-4">
        {data.target_industries && data.target_industries.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              Target Industries
            </p>
            <div className="flex flex-wrap gap-2">
              {data.target_industries.map((industry, idx) => (
                <Badge key={idx} variant="secondary">{industry}</Badge>
              ))}
            </div>
          </div>
        )}

        {data.target_company_size && data.target_company_size.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Building className="w-3 h-3" />
              Company Size Focus
            </p>
            <div className="flex flex-wrap gap-2">
              {data.target_company_size.map((size, idx) => (
                <Badge key={idx} variant="outline">{size}</Badge>
              ))}
            </div>
          </div>
        )}

        {data.primary_use_cases && data.primary_use_cases.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Lightbulb className="w-3 h-3" />
              Primary Use Cases
            </p>
            <ul className="space-y-1.5">
              {data.primary_use_cases.map((useCase, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">●</span>
                  <span>{useCase}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.ideal_customer_profile && (
          <div className="pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Ideal Customer Profile</p>
            <p className="text-sm">{data.ideal_customer_profile}</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
