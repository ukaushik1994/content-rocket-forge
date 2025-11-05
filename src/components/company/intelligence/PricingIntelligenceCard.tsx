import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Check, Gift, Clock } from 'lucide-react';
import { CompetitorAutoFillPayload } from '@/types/competitor-intel';

interface PricingIntelligenceCardProps {
  data: CompetitorAutoFillPayload;
}

export function PricingIntelligenceCard({ data }: PricingIntelligenceCardProps) {
  const hasData = data.pricing_model || data.pricing_tiers?.length || 
                  data.has_free_trial !== undefined || data.has_free_plan !== undefined;

  if (!hasData) return null;

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-primary" />
        Pricing Intelligence
      </h3>
      <div className="space-y-4">
        {data.pricing_model && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Pricing Model</p>
            <Badge variant="secondary">{data.pricing_model}</Badge>
          </div>
        )}
        
        <div className="flex gap-2">
          {data.has_free_trial && (
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              Free Trial
            </Badge>
          )}
          {data.has_free_plan && (
            <Badge variant="outline" className="gap-1">
              <Gift className="w-3 h-3" />
              Free Plan
            </Badge>
          )}
        </div>

        {data.pricing_tiers && data.pricing_tiers.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Pricing Tiers</p>
            <div className="grid gap-3">
              {data.pricing_tiers.map((tier, idx) => (
                <GlassCard key={idx} className="p-4 bg-card/40">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{tier.name}</h4>
                    {tier.price && <Badge>{tier.price}</Badge>}
                  </div>
                  {tier.features && tier.features.length > 0 && (
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {tier.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <Check className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {tier.features.length > 3 && (
                        <li className="text-xs text-muted-foreground">
                          +{tier.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  )}
                </GlassCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
