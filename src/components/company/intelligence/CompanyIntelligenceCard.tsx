import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Calendar, TrendingUp, Users, Target, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { CompetitorAutoFillPayload } from '@/types/competitor-intel';

interface CompanyIntelligenceCardProps {
  data?: CompetitorAutoFillPayload;
  onExtract?: () => void;
  isExtracting?: boolean;
}

export function CompanyIntelligenceCard({ data, onExtract, isExtracting }: CompanyIntelligenceCardProps) {
  const fields = [
    { key: 'company_size', label: 'Company Size', icon: Target, value: data?.company_size },
    { key: 'founded_year', label: 'Founded', icon: Calendar, value: data?.founded_year },
    { key: 'headquarters', label: 'Headquarters', icon: MapPin, value: data?.headquarters },
    { key: 'funding_stage', label: 'Funding Stage', icon: TrendingUp, value: data?.funding_stage },
    { key: 'employee_count', label: 'Employees', icon: Users, value: data?.employee_count },
    { key: 'customer_count', label: 'Customers', icon: Target, value: data?.customer_count },
  ];

  const extractedCount = fields.filter(f => f.value).length;
  const completeness = Math.round((extractedCount / fields.length) * 100);

  if (!data) {
    return (
      <GlassCard className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Company Intelligence</h3>
            </div>
            <Badge variant="outline" className="gap-1">
              <AlertCircle className="w-3 h-3" />
              No Data
            </Badge>
          </div>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Extract company facts like size, location, funding stage
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

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Company Intelligence</h3>
        </div>
        <Badge variant={completeness >= 75 ? "default" : completeness >= 50 ? "secondary" : "outline"} className="gap-1">
          {completeness >= 75 ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {completeness}% Complete
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {fields.map(field => (
          <div key={field.key} className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <field.icon className="w-3 h-3" />
              {field.label}
            </p>
            {field.value ? (
              field.key === 'company_size' || field.key === 'funding_stage' ? (
                <Badge variant="secondary">{field.value}</Badge>
              ) : (
                <p className="text-sm font-medium">{field.value}</p>
              )
            ) : (
              <p className="text-xs text-muted-foreground italic">Not available</p>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
