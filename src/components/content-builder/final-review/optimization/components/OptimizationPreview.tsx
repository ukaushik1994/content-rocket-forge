import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, TrendingUp, Copy } from 'lucide-react';
import { OptimizationSuggestion } from '../types';
import { toast } from 'sonner';

interface OptimizationPreviewProps {
  originalContent: string;
  optimizedContent: string | null;
  appliedSuggestions: OptimizationSuggestion[];
  isOptimizing: boolean;
  onApplyChanges: () => void;
  onCancel: () => void;
}

export const OptimizationPreview: React.FC<OptimizationPreviewProps> = ({
  originalContent,
  optimizedContent,
  appliedSuggestions,
  isOptimizing,
  onApplyChanges,
  onCancel
}) => {
  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Content copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const calculateImprovements = () => {
    const originalLength = originalContent.length;
    const optimizedLength = optimizedContent?.length || 0;
    const changePercentage = originalLength > 0 
      ? Math.round(((optimizedLength - originalLength) / originalLength) * 100)
      : 0;

    return {
      lengthChange: changePercentage,
      suggestionsApplied: appliedSuggestions.length,
      highImpactChanges: appliedSuggestions.filter(s => s.impact === 'high').length
    };
  };

  const improvements = calculateImprovements();

  if (isOptimizing) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Optimizing content...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!optimizedContent) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Optimization Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Optimization Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {improvements.suggestionsApplied}
              </div>
              <div className="text-sm text-muted-foreground">Improvements Applied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {improvements.highImpactChanges}
              </div>
              <div className="text-sm text-muted-foreground">High Impact Changes</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${improvements.lengthChange >= 0 ? 'text-green-500' : 'text-orange-500'}`}>
                {improvements.lengthChange > 0 ? '+' : ''}{improvements.lengthChange}%
              </div>
              <div className="text-sm text-muted-foreground">Content Length</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applied Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Applied Improvements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {appliedSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{suggestion.title}</div>
                  <div className="text-xs text-muted-foreground">{suggestion.description}</div>
                </div>
                <div className="flex gap-1">
                  <Badge variant={suggestion.impact === 'high' ? 'destructive' : suggestion.impact === 'medium' ? 'default' : 'secondary'}>
                    {suggestion.impact} impact
                  </Badge>
                  <Badge variant="outline">{suggestion.category}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Content Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Original Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-muted-foreground">Original Content</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(originalContent)}
                  className="h-6 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="max-h-64 overflow-y-auto p-3 bg-gray-50 rounded-lg text-sm">
                {originalContent.substring(0, 500)}
                {originalContent.length > 500 && '...'}
              </div>
              <div className="text-xs text-muted-foreground">
                {originalContent.length} characters
              </div>
            </div>

            {/* Optimized Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-green-600">Optimized Content</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(optimizedContent)}
                  className="h-6 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="max-h-64 overflow-y-auto p-3 bg-green-50 rounded-lg text-sm">
                {optimizedContent.substring(0, 500)}
                {optimizedContent.length > 500 && '...'}
              </div>
              <div className="text-xs text-muted-foreground">
                {optimizedContent.length} characters
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onApplyChanges} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
          Apply Changes
        </Button>
      </div>
    </div>
  );
};