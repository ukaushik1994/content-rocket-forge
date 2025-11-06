import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { CompetitorAutoFillPayload } from '@/types/competitor-intel';

interface ProductIntelligenceCardProps {
  data?: CompetitorAutoFillPayload;
  onExtract?: () => void;
  isExtracting?: boolean;
}

export function ProductIntelligenceCard({ data, onExtract, isExtracting }: ProductIntelligenceCardProps) {
  const fields = [
    { key: 'product_categories', label: 'Categories', value: data?.product_categories?.length },
    { key: 'key_features', label: 'Key Features', value: data?.key_features?.length },
    { key: 'integrations_count', label: 'Integrations', value: data?.integrations_count },
    { key: 'technology_stack', label: 'Tech Stack', value: data?.technology_stack?.length },
    { key: 'deployment_options', label: 'Deployment', value: data?.deployment_options?.length },
  ];

  const extractedCount = fields.filter(f => f.value).length;
  const completeness = Math.round((extractedCount / fields.length) * 100);
  const hasData = data?.product_categories?.length || data?.key_features?.length || 
                  data?.integrations_count || data?.technology_stack?.length || 
                  data?.deployment_options?.length;

  if (!data) {
    return (
      <GlassCard className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Product Intelligence</h3>
            </div>
            <Badge variant="outline" className="gap-1">
              <AlertCircle className="w-3 h-3" />
              No Data
            </Badge>
          </div>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Extract product features, categories, and tech stack
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
            <Package className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Product Intelligence</h3>
          </div>
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            0% Complete
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          No product data extracted. Try running extraction again.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Product Intelligence</h3>
        </div>
        <Badge variant={completeness >= 75 ? "default" : completeness >= 50 ? "secondary" : "outline"} className="gap-1">
          {completeness >= 75 ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {completeness}% Complete
        </Badge>
      </div>
      <div className="space-y-4">
        {data.product_categories && data.product_categories.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              {data.product_categories.map((cat, idx) => (
                <Badge key={idx} variant="secondary">{cat}</Badge>
              ))}
            </div>
          </div>
        )}

        {data.key_features && data.key_features.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Key Features</p>
            <ul className="space-y-1">
              {data.key_features.slice(0, 5).map((feature, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">●</span>
                  <span>{feature}</span>
                </li>
              ))}
              {data.key_features.length > 5 && (
                <li className="text-xs text-muted-foreground ml-4">
                  +{data.key_features.length - 5} more features
                </li>
              )}
            </ul>
          </div>
        )}

        {data.integrations_count && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Integrations</p>
            <Badge variant="outline">{data.integrations_count} integrations</Badge>
          </div>
        )}

        {data.technology_stack && data.technology_stack.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Technology Stack</p>
            <div className="flex flex-wrap gap-2">
              {data.technology_stack.map((tech, idx) => (
                <Badge key={idx} variant="outline">{tech}</Badge>
              ))}
            </div>
          </div>
        )}

        {data.deployment_options && data.deployment_options.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Deployment Options</p>
            <div className="flex flex-wrap gap-2">
              {data.deployment_options.map((option, idx) => (
                <Badge key={idx} variant="secondary">{option}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
