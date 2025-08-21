import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SolutionSelector } from '@/components/content-builder/steps/SolutionSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StrategyEnhancedSolutionSelectorProps {
  proposal: any;
}

export function StrategyEnhancedSolutionSelector({ proposal }: StrategyEnhancedSolutionSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Select Your Solution</h3>
        <p className="text-muted-foreground">
          Choose the solution you want to feature in the content for "{proposal?.primary_keyword || 'this strategy'}"
        </p>
      </div>

      {/* Strategy Context Card */}
      {proposal && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Strategy Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-xs font-medium text-primary">Primary Keyword:</span>
              <span className="text-sm ml-2">{proposal.primary_keyword}</span>
            </div>
            {proposal.secondary_keywords && proposal.secondary_keywords.length > 0 && (
              <div>
                <span className="text-xs font-medium text-primary">Secondary Keywords:</span>
                <span className="text-sm ml-2">{proposal.secondary_keywords.slice(0, 3).join(', ')}</span>
                {proposal.secondary_keywords.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{proposal.secondary_keywords.length - 3} more</span>
                )}
              </div>
            )}
            {proposal.description && (
              <div>
                <span className="text-xs font-medium text-primary">Description:</span>
                <p className="text-sm text-muted-foreground mt-1">{proposal.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Use existing Content Builder SolutionSelector */}
      <SolutionSelector />
    </div>
  );
}