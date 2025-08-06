import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';

interface FormProgressIndicatorProps {
  formData: Partial<EnhancedSolution>;
  currentTab: string;
  lastSaved?: Date | null;
  isDirty?: boolean;
  hasErrors?: boolean;
}

const TAB_CONFIG = [
  { id: 'basic', name: 'Basic Info', weight: 25 },
  { id: 'features', name: 'Features', weight: 20 },
  { id: 'market', name: 'Market', weight: 15 },
  { id: 'technical', name: 'Technical', weight: 15 },
  { id: 'pricing', name: 'Pricing', weight: 10 },
  { id: 'competitors', name: 'Competitors', weight: 5 },
  { id: 'cases', name: 'Case Studies', weight: 5 },
  { id: 'resources', name: 'Resources', weight: 5 }
];

export const FormProgressIndicator: React.FC<FormProgressIndicatorProps> = ({
  formData,
  currentTab,
  lastSaved,
  isDirty = false,
  hasErrors = false
}) => {
  const calculateTabCompletion = (tabId: string): number => {
    switch (tabId) {
      case 'basic':
        const basicFields = [formData.name, formData.description, formData.category];
        return Math.round((basicFields.filter(Boolean).length / basicFields.length) * 100);
      
      case 'features':
        const featuresCount = (formData.features?.length || 0) + (formData.benefits?.length || 0);
        return Math.min(Math.round((featuresCount / 6) * 100), 100);
      
      case 'market':
        const marketFields = [
          formData.targetAudience?.length,
          formData.useCases?.length,
          formData.painPoints?.length
        ];
        const marketScore = marketFields.filter(field => field && field > 0).length;
        return Math.round((marketScore / marketFields.length) * 100);
      
      case 'technical':
        // Check for any technical-related fields
        return (formData.technicalSpecs || formData.integrations) ? 100 : 0;
      
      case 'pricing':
        return formData.pricing ? 100 : 0;
      
      case 'competitors':
        return (formData.competitors?.length || 0) > 0 ? 100 : 0;
      
      case 'cases':
        return (formData.caseStudies?.length || 0) > 0 ? 100 : 0;
      
      case 'resources':
        return (formData.resources?.length || 0) > 0 ? 100 : 0;
      
      default:
        return 0;
    }
  };

  const calculateOverallProgress = (): number => {
    const weightedProgress = TAB_CONFIG.reduce((total, tab) => {
      const completion = calculateTabCompletion(tab.id) / 100;
      return total + (completion * tab.weight);
    }, 0);
    
    return Math.round(weightedProgress);
  };

  const getTabStatus = (tabId: string) => {
    const completion = calculateTabCompletion(tabId);
    if (completion === 100) return 'complete';
    if (completion > 0) return 'inProgress';
    return 'pending';
  };

  const getSaveStatus = () => {
    if (hasErrors) return { icon: AlertCircle, text: 'Has errors', color: 'text-destructive' };
    if (isDirty) return { icon: Clock, text: 'Unsaved changes', color: 'text-warning' };
    if (lastSaved) return { icon: CheckCircle, text: `Saved ${lastSaved.toLocaleTimeString()}`, color: 'text-success' };
    return { icon: Circle, text: 'Not saved', color: 'text-muted-foreground' };
  };

  const overallProgress = calculateOverallProgress();
  const saveStatus = getSaveStatus();

  return (
    <Card className="bg-gradient-to-r from-background/50 to-muted/30 border-border/50">
      <CardContent className="p-4 space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Form Completion</span>
            <span className="text-muted-foreground">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Tab Progress Grid */}
        <div className="grid grid-cols-4 gap-2">
          {TAB_CONFIG.map((tab) => {
            const status = getTabStatus(tab.id);
            const completion = calculateTabCompletion(tab.id);
            const isActive = currentTab === tab.id;
            
            return (
              <div
                key={tab.id}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg border transition-all",
                  isActive 
                    ? "border-primary bg-primary/5" 
                    : "border-border/30 hover:border-border/60",
                  status === 'complete' && "bg-success/5 border-success/30"
                )}
              >
                <div className="flex items-center gap-1 mb-1">
                  {status === 'complete' ? (
                    <CheckCircle className="h-3 w-3 text-success" />
                  ) : status === 'inProgress' ? (
                    <Clock className="h-3 w-3 text-warning" />
                  ) : (
                    <Circle className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <span className="text-xs font-medium text-center leading-tight">
                  {tab.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {completion}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Save Status */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <saveStatus.icon className={cn("h-4 w-4", saveStatus.color)} />
            <span className={cn("text-sm", saveStatus.color)}>
              {saveStatus.text}
            </span>
          </div>
          
          {overallProgress >= 60 && (
            <div className="text-xs text-success">
              Ready to publish ✓
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};