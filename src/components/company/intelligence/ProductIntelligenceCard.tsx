import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Package, Layers, Plug, Code, Cloud } from 'lucide-react';
import { CompetitorAutoFillPayload } from '@/types/competitor-intel';

interface ProductIntelligenceCardProps {
  data: CompetitorAutoFillPayload;
}

export function ProductIntelligenceCard({ data }: ProductIntelligenceCardProps) {
  const hasData = data.product_categories?.length || data.key_features?.length || 
                  data.integrations_count || data.technology_stack?.length || data.deployment_options?.length;

  if (!hasData) {
    return (
      <GlassCard className="p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="h-8 w-8 text-primary/50" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">No Product Intelligence</h3>
            <p className="text-sm text-muted-foreground">
              Product features and specs will appear after extraction
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-primary" />
        Product Intelligence
      </h3>
      <div className="space-y-4">
        {data.product_categories && data.product_categories.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Categories
            </p>
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
            <ul className="space-y-1.5">
              {data.key_features.slice(0, 5).map((feature, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">●</span>
                  <span>{feature}</span>
                </li>
              ))}
              {data.key_features.length > 5 && (
                <li className="text-xs text-muted-foreground">
                  +{data.key_features.length - 5} more features
                </li>
              )}
            </ul>
          </div>
        )}

        {data.integrations_count && (
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Plug className="w-3 h-3" />
              Integrations
            </p>
            <Badge variant="outline" className="text-base font-semibold">
              {data.integrations_count}+
            </Badge>
          </div>
        )}

        {data.technology_stack && data.technology_stack.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Code className="w-3 h-3" />
              Technology Stack
            </p>
            <div className="flex flex-wrap gap-2">
              {data.technology_stack.map((tech, idx) => (
                <Badge key={idx} variant="outline">{tech}</Badge>
              ))}
            </div>
          </div>
        )}

        {data.deployment_options && data.deployment_options.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Cloud className="w-3 h-3" />
              Deployment
            </p>
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
