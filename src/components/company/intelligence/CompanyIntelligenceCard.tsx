import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Calendar, TrendingUp, Users, Target } from 'lucide-react';
import { CompetitorAutoFillPayload } from '@/types/competitor-intel';

interface CompanyIntelligenceCardProps {
  data: CompetitorAutoFillPayload;
}

export function CompanyIntelligenceCard({ data }: CompanyIntelligenceCardProps) {
  const hasData = data.company_size || data.founded_year || data.headquarters || 
                  data.funding_stage || data.employee_count || data.customer_count;

  if (!hasData) return null;

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-primary" />
        Company Intelligence
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {data.company_size && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Target className="w-3 h-3" />
              Company Size
            </p>
            <Badge variant="secondary">{data.company_size} employees</Badge>
          </div>
        )}
        {data.founded_year && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Founded
            </p>
            <p className="text-sm font-medium">{data.founded_year}</p>
          </div>
        )}
        {data.headquarters && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Headquarters
            </p>
            <p className="text-sm font-medium">{data.headquarters}</p>
          </div>
        )}
        {data.funding_stage && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Funding Stage
            </p>
            <Badge variant="outline">{data.funding_stage}</Badge>
          </div>
        )}
        {data.employee_count && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              Employees
            </p>
            <p className="text-sm font-medium">{data.employee_count}</p>
          </div>
        )}
        {data.customer_count && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Target className="w-3 h-3" />
              Customers
            </p>
            <p className="text-sm font-medium">{data.customer_count}</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
