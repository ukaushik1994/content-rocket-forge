import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';

interface ValidationRule {
  id: string;
  field: string;
  level: 'error' | 'warning' | 'info' | 'success';
  message: string;
  suggestion?: string;
  autoFix?: () => void;
}

interface SmartValidationProps {
  formData: Partial<EnhancedSolution>;
  onFieldUpdate?: (field: string, value: any) => void;
  className?: string;
}

export const SmartValidation: React.FC<SmartValidationProps> = ({
  formData,
  onFieldUpdate,
  className
}) => {
  const [validationResults, setValidationResults] = useState<ValidationRule[]>([]);

  useEffect(() => {
    const validateForm = (): ValidationRule[] => {
      const rules: ValidationRule[] = [];

      // Name validation
      if (!formData.name?.trim()) {
        rules.push({
          id: 'name-required',
          field: 'name',
          level: 'error',
          message: 'Solution name is required',
          suggestion: 'Add a clear, descriptive name for your solution'
        });
      } else if (formData.name.length < 3) {
        rules.push({
          id: 'name-too-short',
          field: 'name',
          level: 'warning',
          message: 'Solution name is very short',
          suggestion: 'Consider using a more descriptive name (3+ characters)'
        });
      } else if (formData.name.length >= 3) {
        rules.push({
          id: 'name-good',
          field: 'name',
          level: 'success',
          message: 'Good solution name'
        });
      }

      // Description validation
      if (!formData.description?.trim()) {
        rules.push({
          id: 'description-required',
          field: 'description',
          level: 'warning',
          message: 'Description helps users understand your solution',
          suggestion: 'Add a detailed description of what your solution does'
        });
      } else if (formData.description.length < 50) {
        rules.push({
          id: 'description-too-short',
          field: 'description',
          level: 'info',
          message: 'Description could be more detailed',
          suggestion: 'Consider adding more details about features and benefits'
        });
      } else {
        rules.push({
          id: 'description-good',
          field: 'description',
          level: 'success',
          message: 'Comprehensive description'
        });
      }

      // Features validation
      if (!formData.features?.length) {
        rules.push({
          id: 'features-missing',
          field: 'features',
          level: 'warning',
          message: 'No features listed',
          suggestion: 'Add key features to highlight solution capabilities'
        });
      } else if (formData.features.length < 3) {
        rules.push({
          id: 'features-few',
          field: 'features',
          level: 'info',
          message: 'Consider adding more features',
          suggestion: 'Most solutions benefit from 3+ key features listed'
        });
      } else {
        rules.push({
          id: 'features-good',
          field: 'features',
          level: 'success',
          message: `${formData.features.length} features listed`
        });
      }

      // URL validation
      if (formData.externalUrl && !isValidUrl(formData.externalUrl)) {
        rules.push({
          id: 'url-invalid',
          field: 'externalUrl',
          level: 'error',
          message: 'Invalid URL format',
          suggestion: 'Ensure URL starts with http:// or https://'
        });
      }

      // Category validation
      if (!formData.category) {
        rules.push({
          id: 'category-missing',
          field: 'category',
          level: 'info',
          message: 'Select a category to help users find your solution',
          suggestion: 'Choose the most appropriate category for better discoverability'
        });
      }

      // Target audience validation
      if (!formData.targetAudience?.length) {
        rules.push({
          id: 'audience-missing',
          field: 'targetAudience',
          level: 'info',
          message: 'Define your target audience',
          suggestion: 'Specify who would benefit most from your solution'
        });
      }

      // Use cases validation
      if (!formData.useCases?.length) {
        rules.push({
          id: 'usecases-missing',
          field: 'useCases',
          level: 'info',
          message: 'Add use cases to show practical applications',
          suggestion: 'Describe specific scenarios where your solution helps'
        });
      }

      return rules;
    };

    setValidationResults(validateForm());
  }, [formData]);

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const getIcon = (level: ValidationRule['level']) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'info':
        return <Info className="h-4 w-4 text-info" />;
      default:
        return null;
    }
  };

  const getBadgeVariant = (level: ValidationRule['level']) => {
    switch (level) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const groupedResults = validationResults.reduce((acc, rule) => {
    if (!acc[rule.level]) acc[rule.level] = [];
    acc[rule.level].push(rule);
    return acc;
  }, {} as Record<string, ValidationRule[]>);

  const levelOrder: ValidationRule['level'][] = ['error', 'warning', 'info', 'success'];

  return (
    <div className={className}>
      <div className="space-y-3">
        {levelOrder.map(level => {
          const rules = groupedResults[level] || [];
          if (rules.length === 0) return null;

          return (
            <div key={level} className="space-y-2">
              {rules.map(rule => (
                <div 
                  key={rule.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/30 bg-muted/20"
                >
                  {getIcon(rule.level)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{rule.message}</span>
                      <Badge variant={getBadgeVariant(rule.level)} className="text-xs">
                        {rule.level}
                      </Badge>
                    </div>
                    
                    {rule.suggestion && (
                      <p className="text-xs text-muted-foreground">
                        {rule.suggestion}
                      </p>
                    )}
                  </div>

                  {rule.autoFix && (
                    <button
                      onClick={rule.autoFix}
                      className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      Fix
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {validationResults.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
          <p className="text-sm">All validations passed!</p>
        </div>
      )}
    </div>
  );
};