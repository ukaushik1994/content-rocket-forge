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
          <Tabs defaultValue="type" className="space-y-4">
            <TabsList>
              <TabsTrigger value="type">Content Type</TabsTrigger>
              <TabsTrigger value="format">Format</TabsTrigger>
              <TabsTrigger value="intent">Intent</TabsTrigger>
            </TabsList>
            
            <TabsContent value="type" className="space-y-4">
              <div>
                <Label className="text-base">Select Content Type</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose the type of content you want to create
                </p>
                
                <RadioGroup 
                  value={contentType} 
                  onValueChange={handleContentTypeChange}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="blog" id="blog" className="peer sr-only" />
                    <Label
                      htmlFor="blog"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="text-sm font-medium">Blog Post</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="article" id="article" className="peer sr-only" />
                    <Label
                      htmlFor="article"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="text-sm font-medium">Article</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="landing-page" id="landing-page" className="peer sr-only" />
                    <Label
                      htmlFor="landing-page"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="text-sm font-medium">Landing Page</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="product-description" id="product-description" className="peer sr-only" />
                    <Label
                      htmlFor="product-description"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="text-sm font-medium">Product Description</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </TabsContent>
            
            <TabsContent value="format" className="space-y-4">
              <div>
                <Label className="text-base">Select Content Format</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose the format that best suits your content
                </p>
                
                <RadioGroup 
                  value={contentFormat} 
                  onValueChange={handleContentFormatChange}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="how-to" id="how-to" className="peer sr-only" />
                    <Label
                      htmlFor="how-to"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="text-sm font-medium">How-to Guide</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="list" id="list" className="peer sr-only" />
                    <Label
                      htmlFor="list"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="text-sm font-medium">List</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="opinion" id="opinion" className="peer sr-only" />
                    <Label
                      htmlFor="opinion"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="text-sm font-medium">Opinion</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="review" id="review" className="peer sr-only" />
                    <Label
                      htmlFor="review"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="text-sm font-medium">Review</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </TabsContent>
            
            <TabsContent value="intent" className="space-y-4">
              <div>
                <Label className="text-base">Select Content Intent</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  What is the primary goal of your content?
                </p>
                
                <RadioGroup 
                  value={contentIntent} 
                  onValueChange={handleContentIntentChange}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="inform" id="inform" className="peer sr-only" />
                    <Label
                      htmlFor="inform"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="text-sm font-medium">Inform</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="persuade" id="persuade" className="peer sr-only" />
                    <Label
                      htmlFor="persuade"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="text-sm font-medium">Persuade</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="entertain" id="entertain" className="peer sr-only" />
                    <Label
                      htmlFor="entertain"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="text-sm font-medium">Entertain</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="sell" id="sell" className="peer sr-only" />
                    <Label
                      htmlFor="sell"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="text-sm font-medium">Sell</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </TabsContent>
          </Tabs>
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
