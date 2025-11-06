import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Check, Sparkles, Loader2, CheckCircle2, AlertCircle, Gift, Clock } from 'lucide-react';
import { CompetitorAutoFillPayload } from '@/types/competitor-intel';

interface PricingIntelligenceCardProps {
  data?: CompetitorAutoFillPayload;
  onExtract?: () => void;
  isExtracting?: boolean;
}

export function PricingIntelligenceCard({ data, onExtract, isExtracting }: PricingIntelligenceCardProps) {
  const fields = [
    { key: 'pricing_model', label: 'Pricing Model', value: data?.pricing_model },
    { key: 'pricing_tiers', label: 'Pricing Tiers', value: data?.pricing_tiers?.length },
    { key: 'has_free_trial', label: 'Free Trial', value: data?.has_free_trial },
    { key: 'has_free_plan', label: 'Free Plan', value: data?.has_free_plan },
  ];

  const extractedCount = fields.filter(f => f.value).length;
  const completeness = Math.round((extractedCount / fields.length) * 100);
  const hasData = data?.pricing_model || data?.pricing_tiers?.length || data?.has_free_trial || data?.has_free_plan;

  if (!data) {
    return (
      <GlassCard className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Pricing Intelligence</h3>
            </div>
            <Badge variant="outline" className="gap-1">
              <AlertCircle className="w-3 h-3" />
              No Data
            </Badge>
          </div>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Extract pricing model, tiers, and trial options
            </p>
            {onExtract && (
              <Button onClick={onExtract} disabled={isExtracting} size="sm" variant="outline">
                {isExtracting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Extract Data
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </GlassCard>
    );
  }

  if (!hasData) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Pricing Intelligence</h3>
          </div>
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            0% Complete
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          No pricing data extracted. Try running extraction again.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Pricing Intelligence</h3>
        </div>
        <Badge variant={completeness >= 75 ? "default" : completeness >= 50 ? "secondary" : "outline"} className="gap-1">
          {completeness >= 75 ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {completeness}% Complete
        </Badge>
      </div>
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
