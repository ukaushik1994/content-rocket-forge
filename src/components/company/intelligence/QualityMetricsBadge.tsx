import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CompetitorIntelDiagnostics } from '@/types/competitor-intel';

interface QualityMetricsBadgeProps {
  metrics: CompetitorIntelDiagnostics;
}

export function QualityMetricsBadge({ metrics }: QualityMetricsBadgeProps) {
  const { completeness_score = 0, confidence_score = 0, quality_rating, fields_extracted = 0, fields_missing = [] } = metrics;

  const getQualityColor = () => {
    if (!quality_rating) return 'secondary';
    switch (quality_rating) {
      case 'excellent':
        return 'default';
      case 'good':
        return 'default';
      case 'fair':
        return 'secondary';
      case 'poor':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getQualityIcon = () => {
    if (!quality_rating) return <Info className="w-3 h-3" />;
    if (quality_rating === 'excellent' || quality_rating === 'good') {
      return <CheckCircle2 className="w-3 h-3" />;
    }
    return <AlertTriangle className="w-3 h-3" />;
  };

  const getQualityLabel = () => {
    if (!quality_rating) return 'No Data';
    return quality_rating.charAt(0).toUpperCase() + quality_rating.slice(1);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getQualityColor()} className="gap-1.5">
            {getQualityIcon()}
            {getQualityLabel()} Intelligence
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between gap-4">
              <span>Completeness:</span>
              <span className="font-semibold">{completeness_score}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Confidence:</span>
              <span className="font-semibold">{confidence_score}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Fields Extracted:</span>
              <span className="font-semibold">{fields_extracted}</span>
            </div>
            {fields_missing.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-muted-foreground">Missing: {fields_missing.slice(0, 3).join(', ')}</p>
                {fields_missing.length > 3 && (
                  <p className="text-muted-foreground">+{fields_missing.length - 3} more</p>
                )}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
