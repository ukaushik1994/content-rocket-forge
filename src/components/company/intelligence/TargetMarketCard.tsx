import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { CompetitorAutoFillPayload } from '@/types/competitor-intel';

interface TargetMarketCardProps {
  data?: CompetitorAutoFillPayload;
  onExtract?: () => void;
  isExtracting?: boolean;
}

export function TargetMarketCard({ data, onExtract, isExtracting }: TargetMarketCardProps) {
  const fields = [
    { key: 'target_industries', label: 'Target Industries', value: data?.target_industries?.length },
    { key: 'target_company_size', label: 'Company Size', value: data?.target_company_size?.length },
    { key: 'primary_use_cases', label: 'Use Cases', value: data?.primary_use_cases?.length },
    { key: 'ideal_customer_profile', label: 'ICP', value: data?.ideal_customer_profile },
  ];

  const extractedCount = fields.filter(f => f.value).length;
  const completeness = Math.round((extractedCount / fields.length) * 100);
  const hasData = data?.target_industries?.length || data?.target_company_size?.length || 
                  data?.primary_use_cases?.length || data?.ideal_customer_profile;

  if (!data) {
    return (
      <GlassCard className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Target Market</h3>
            </div>
            <Badge variant="outline" className="gap-1">
              <AlertCircle className="w-3 h-3" />
              No Data
            </Badge>
          </div>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Extract target industries, company sizes, and use cases
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
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Target Market</h3>
          </div>
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            0% Complete
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          No target market data extracted. Try running extraction again.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Target Market</h3>
        </div>
        <Badge variant={completeness >= 75 ? "default" : completeness >= 50 ? "secondary" : "outline"} className="gap-1">
          {completeness >= 75 ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {completeness}% Complete
        </Badge>
      </div>
      <div className="space-y-4">
        {data.target_industries && data.target_industries.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Target Industries</p>
            <div className="flex flex-wrap gap-2">
              {data.target_industries.map((industry, idx) => (
                <Badge key={idx} variant="secondary">{industry}</Badge>
              ))}
            </div>
          </div>
        )}

        {data.target_company_size && data.target_company_size.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Company Size Focus</p>
            <div className="flex flex-wrap gap-2">
              {data.target_company_size.map((size, idx) => (
                <Badge key={idx} variant="outline">{size}</Badge>
              ))}
            </div>
          </div>
        )}

        {data.primary_use_cases && data.primary_use_cases.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Primary Use Cases</p>
            <ul className="space-y-2">
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
          <div>
            <p className="text-xs text-muted-foreground mb-2">Ideal Customer Profile</p>
            <p className="text-sm">{data.ideal_customer_profile}</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
