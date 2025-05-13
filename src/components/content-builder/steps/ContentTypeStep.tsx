import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SolutionManager } from '@/components/solutions/manager';
import { Solution } from '@/contexts/content-builder/types';

export const ContentTypeStep = () => {
  const { state, dispatch, setContentType, setContentFormat, setContentIntent, setSelectedSolution } = useContentBuilder();
  const { contentType, contentFormat, contentIntent, selectedSolution } = state;
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // If type, format, and intent are set, mark this step as completed
    if (contentType && contentFormat && contentIntent) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 1 });
    }
  }, [contentType, contentFormat, contentIntent, dispatch]);

  // Handle content type change
  const handleContentTypeChange = (value: string) => {
    setContentType(value as any);
  };

  // Handle content format change
  const handleContentFormatChange = (value: string) => {
    setContentFormat(value as any);
  };

  // Handle content intent change
  const handleContentIntentChange = (value: string) => {
    setContentIntent(value as any);
  };

  return (
    <div className="space-y-6">
      {/* Content Type Options */}
      <Card>
        <CardContent className="pt-6">
          {/* ... other content type options */}
        </CardContent>
      </Card>

      {/* Solution selection section */}
      <Card className="border-0 bg-gradient-to-br from-purple-900/20 to-blue-900/30 shadow-xl">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Select a Solution to Feature</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Choosing a solution will help tailor your content to promote specific products or services.
          </p>

          <div className="grid gap-6">
            <SolutionManager searchTerm={searchTerm} />
          </div>
        </CardContent>
      </Card>

      {/* Selected Solution */}
      {selectedSolution && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium">Selected Solution: {selectedSolution.name}</h3>
          <p>{selectedSolution.description}</p>
          
          {/* Display key features */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Key Features</h4>
            <ul className="list-disc pl-5 space-y-1">
              {selectedSolution.features.slice(0, 4).map((feature, index) => (
                <li key={index} className="text-sm">{feature}</li>
              ))}
            </ul>
          </div>
          
          {/* Display benefits if available */}
          {selectedSolution.benefits && selectedSolution.benefits.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Benefits</h4>
              <ul className="list-disc pl-5 space-y-1">
                {selectedSolution.benefits.slice(0, 3).map((benefit, index) => (
                  <li key={index} className="text-sm">{benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
