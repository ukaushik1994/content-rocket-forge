import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Bot, 
  TrendingUp, 
  Lightbulb, 
  Target,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';

interface ComplianceCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  violations: Array<{
    id: string;
    message: string;
    description: string;
    severity: 'critical' | 'major' | 'minor';
    category: string;
    textLocation?: {
      start: number;
      end: number;
      text: string;
    };
  }>;
}

interface OptimizationSuggestionsPanelProps {
  complianceCategories: ComplianceCategory[];
  selectedViolations: string[];
  onToggleViolation: (violationId: string) => void;
  onSelectAllInCategory: (categoryId: string) => void;
  onSelectAllCritical: () => void;
  onClearAll: () => void;
  totalViolationCount: number;
}

export const OptimizationSuggestionsPanel: React.FC<OptimizationSuggestionsPanelProps> = ({
  complianceCategories,
  selectedViolations,
  onToggleViolation,
  onSelectAllInCategory,
  onSelectAllCritical,
  onClearAll,
  totalViolationCount
}) => {

  const getSeverityColor = (severity: 'critical' | 'major' | 'minor') => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'major': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const selectionProgress = totalViolationCount > 0 ? (selectedViolations.length / totalViolationCount) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Selection Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Selection Progress</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {selectedViolations.length} / {totalViolationCount}
              </span>
            </div>
            <Progress value={selectionProgress} className="h-2" />
            
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={onSelectAllCritical}>
                Select Critical
              </Button>
              <Button size="sm" variant="outline" onClick={onClearAll}>
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions by Category */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-4 pr-4">
          {complianceCategories.map((category) => (
            <Card key={category.id} className="border-l-4 border-l-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <category.icon className={`w-5 h-5 ${category.color}`} />
                    <CardTitle className="text-base">{category.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {category.violations.length}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {category.violations.filter(v => selectedViolations.includes(v.id)).length} selected
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectAllInCategory(category.id)}
                    className="text-xs"
                  >
                    Select All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.violations.map((violation) => {
                  const isSelected = selectedViolations.includes(violation.id);
                  
                  return (
                    <div 
                      key={violation.id} 
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        isSelected ? 'bg-primary/5 border-primary/30' : 'hover:bg-accent/50 border-border'
                      }`}
                      onClick={() => onToggleViolation(violation.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleViolation(violation.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-sm">{violation.message}</h4>
                          <Badge variant="outline" className={`text-xs ${getSeverityColor(violation.severity)}`}>
                            {violation.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{violation.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}

          {complianceCategories.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Info className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No compliance violations found. Your content meets all requirements!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};