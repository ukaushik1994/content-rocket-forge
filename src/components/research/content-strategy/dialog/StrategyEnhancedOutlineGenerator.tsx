import React, { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { AIOutlineGenerator } from '@/components/content-builder/outline/AIOutlineGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useAIServiceStatus } from '@/hooks/useAIServiceStatus';

interface StrategyEnhancedOutlineGeneratorProps {
  proposal: any;
}

export function StrategyEnhancedOutlineGenerator({ proposal }: StrategyEnhancedOutlineGeneratorProps) {
  const { state } = useContentBuilder();
  const { selectedSolution, serpSelections, mainKeyword } = state;
  const navigate = useNavigate();
  const { hasProviders, activeProviders } = useAIServiceStatus();

  const selectedSerpCount = serpSelections.filter(item => item.selected).length;
  
  // Calculate quality level based on SERP selections
  const qualityLevel = selectedSerpCount > 5 ? 'Enhanced' : selectedSerpCount > 0 ? 'Standard' : 'Basic';
  const qualityColor = selectedSerpCount > 5 ? 'text-green-600' : selectedSerpCount > 0 ? 'text-blue-600' : 'text-gray-600';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Generate Content Outline</h3>
        <p className="text-muted-foreground">
          Create a structured outline for "{proposal?.primary_keyword}" featuring {selectedSolution?.name}
        </p>
      </div>

      {/* AI Provider Check Alert */}
      {!hasProviders && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>No AI provider configured. Configure one to generate outlines.</span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/settings/ai')}
            >
              Configure Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* SERP Selection Quality Indicator */}
      {selectedSerpCount === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Tip:</strong> Add SERP research items from Step 1 to improve outline quality and SEO relevance.
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Context Summary */}
      <Card className="bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Outline Context Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>📊 SERP Insights:</span>
            <Badge variant={selectedSerpCount > 0 ? "default" : "secondary"}>
              {selectedSerpCount} items
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>🎯 Solution:</span>
            <Badge variant="outline">{selectedSolution?.name || 'None'}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>🔑 Keyword:</span>
            <Badge variant="outline">{mainKeyword || proposal?.primary_keyword}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>⭐ Quality Level:</span>
            <Badge className={qualityColor}>{qualityLevel}</Badge>
          </div>
          {hasProviders && (
            <div className="flex items-center justify-between">
              <span>🤖 AI Providers:</span>
              <Badge variant="outline">{activeProviders} active</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Context Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Selected Solution Context */}
        {selectedSolution && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Selected Solution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold">{selectedSolution.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedSolution.description}</p>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {selectedSolution.features.slice(0, 4).map((feature, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {selectedSolution.features.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedSolution.features.length - 4} more features
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* SERP Context */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">SERP Research</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Selected SERP Items</span>
                <Badge variant={selectedSerpCount > 0 ? "default" : "secondary"}>
                  {selectedSerpCount} selected
                </Badge>
              </div>
              {selectedSerpCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Your outline will incorporate insights from {selectedSerpCount} SERP research items
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Use existing Content Builder AIOutlineGenerator */}
      <AIOutlineGenerator />
    </div>
  );
}