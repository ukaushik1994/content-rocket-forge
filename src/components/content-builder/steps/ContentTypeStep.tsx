
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ContentType } from '@/contexts/content-builder/types';
import { CheckCircle, AlertCircle, FileText, Newspaper, BookOpen, FileCode, MessageSquare, FilePieChart } from 'lucide-react';
import { toast } from 'sonner';

export const ContentTypeStep = () => {
  const { state, dispatch, setContentType } = useContentBuilder();
  const { contentType, mainKeyword, selectedKeywords } = state;
  const [selectedType, setSelectedType] = useState<ContentType | null>(contentType || null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(state.contentFormat || null);

  useEffect(() => {
    // Check if both type and format are selected to mark step as completed
    if (selectedType && selectedFormat) {
      dispatch({
        type: 'MARK_STEP_COMPLETED',
        payload: 1
      });
    } else {
      // If either is missing, mark the step as incomplete
      if (state.steps[1]?.completed) {
        dispatch({
          type: 'MARK_STEP_INCOMPLETE',
          payload: 1
        });
      }
    }
  }, [selectedType, selectedFormat, dispatch, state.steps]);

  const handleSelectType = (value: ContentType) => {
    setSelectedType(value);
    dispatch({
      type: 'SET_CONTENT_TYPE',
      payload: value
    });
  };

  const handleSelectFormat = (value: string) => {
    setSelectedFormat(value);
    dispatch({
      type: 'SET_CONTENT_FORMAT',
      payload: value
    });
  };

  const handleContinue = () => {
    if (!selectedType || !selectedFormat) {
      toast.error("Please select both a content type and format before continuing");
      return;
    }

    // Mark step as completed and go to next step
    dispatch({
      type: 'MARK_STEP_COMPLETED',
      payload: 1
    });

    // Navigate to next step (skip SERP Analysis step)
    dispatch({
      type: 'SET_ACTIVE_STEP',
      payload: 3
    });
  };

  // Content type definitions with improved descriptions and icons
  const contentTypes = [
    {
      value: 'blog',
      label: 'Blog Post',
      description: 'Informative articles focused on specific topics, ideal for driving organic traffic.',
      icon: <FileText className="h-5 w-5 text-primary" />
    },
    {
      value: 'article',
      label: 'Article',
      description: 'In-depth, researched pieces with a journalistic approach.',
      icon: <Newspaper className="h-5 w-5 text-primary" />
    },
    {
      value: 'guide',
      label: 'Guide',
      description: 'Comprehensive resources that explore a subject in detail, with actionable steps.',
      icon: <BookOpen className="h-5 w-5 text-primary" />
    },
    {
      value: 'landing',
      label: 'Landing Page',
      description: 'Conversion-focused content designed to drive a specific action.',
      icon: <FileCode className="h-5 w-5 text-primary" />
    },
    {
      value: 'social',
      label: 'Social Post',
      description: 'Engaging, shareable content optimized for social media platforms.',
      icon: <MessageSquare className="h-5 w-5 text-primary" />
    },
    {
      value: 'report',
      label: 'Report',
      description: 'Data-focused content that presents findings and analysis.',
      icon: <FilePieChart className="h-5 w-5 text-primary" />
    }
  ];

  const contentFormats = [
    {
      value: 'listicle',
      label: '5 Best Ways to...',
      description: 'Easy-to-scan numbered lists of tips, methods, or examples'
    },
    {
      value: 'how-to',
      label: 'How to...',
      description: 'Step-by-step instructional content with practical advice'
    },
    {
      value: 'why',
      label: 'Why...',
      description: 'Explanatory content that addresses reasons and motivations'
    },
    {
      value: 'what-is',
      label: 'What is...',
      description: 'Definitional content that explains concepts clearly'
    },
    {
      value: 'comparison',
      label: 'X vs Y',
      description: 'Content that compares and contrasts two or more subjects'
    },
    {
      value: 'guide',
      label: 'Complete Guide to...',
      description: 'Comprehensive content that covers all aspects of a topic'
    }
  ];

  return (
    <div className="space-y-8">
      {/* State indicators at top */}
      <div className="flex items-center justify-between bg-white/5 rounded-md p-4 border border-white/10">
        <div className="flex items-start gap-3">
          <div>
            <h3 className="text-base font-medium">Creating content for:</h3>
            <p className="text-sm text-muted-foreground mt-1">
              <strong className="text-primary">{mainKeyword}</strong>
              {selectedKeywords.length > 0 && (
                <> (+{selectedKeywords.length} related keywords)</>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 text-sm">
            {selectedType && selectedFormat ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
            <span className={selectedType && selectedFormat ? "text-green-500" : "text-amber-500"}>
              {selectedType && selectedFormat ? "Ready to continue" : "Select type & format to continue"}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {selectedType ? `${selectedType}` : "No content type selected"} 
            {selectedFormat ? ` • ${selectedFormat}` : ""}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Select Content Type</h2>
          <p className="text-sm text-muted-foreground">
            Choose the type of content you want to create based on your goals and audience
          </p>
          
          <RadioGroup
            value={selectedType || undefined}
            onValueChange={(value) => handleSelectType(value as ContentType)}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2"
          >
            {contentTypes.map((type) => (
              <div key={type.value}>
                <RadioGroupItem
                  value={type.value}
                  id={`content-type-${type.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`content-type-${type.value}`}
                  className="flex flex-col gap-2 rounded-md border border-white/10 bg-white/5 p-4 hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all peer-data-[state=checked]:border-primary/50 peer-data-[state=checked]:bg-primary/5 h-full"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <span className="font-medium">{type.label}</span>
                    </div>
                    <div className="h-4 w-4 rounded-full border border-white/30 flex items-center justify-center peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white">
                      {selectedType === type.value && (
                        <CheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {type.description}
                  </p>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium">Select Content Format</h2>
          <p className="text-sm text-muted-foreground">
            Choose a format that will best engage your audience and convey your message
          </p>
          
          <Tabs
            defaultValue={selectedFormat || "listicle"}
            onValueChange={handleSelectFormat}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 h-auto p-1 w-full">
              <TabsTrigger value="listicle" className="py-2 data-[state=active]:bg-primary/20">
                Lists
              </TabsTrigger>
              <TabsTrigger value="how-to" className="py-2 data-[state=active]:bg-primary/20">
                Guides
              </TabsTrigger>
              <TabsTrigger value="what-is" className="py-2 data-[state=active]:bg-primary/20">
                Explanations
              </TabsTrigger>
            </TabsList>
            <TabsContent value="listicle" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contentFormats.slice(0, 2).map((format) => (
                  <Card
                    key={format.value}
                    className={`cursor-pointer transition-all ${
                      selectedFormat === format.value
                        ? "border-primary/50 bg-primary/5"
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    }`}
                    onClick={() => handleSelectFormat(format.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{format.label}</h3>
                        {selectedFormat === format.value && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{format.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="how-to" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contentFormats.slice(2, 4).map((format) => (
                  <Card
                    key={format.value}
                    className={`cursor-pointer transition-all ${
                      selectedFormat === format.value
                        ? "border-primary/50 bg-primary/5"
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    }`}
                    onClick={() => handleSelectFormat(format.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{format.label}</h3>
                        {selectedFormat === format.value && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{format.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="what-is" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contentFormats.slice(4, 6).map((format) => (
                  <Card
                    key={format.value}
                    className={`cursor-pointer transition-all ${
                      selectedFormat === format.value
                        ? "border-primary/50 bg-primary/5"
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    }`}
                    onClick={() => handleSelectFormat(format.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{format.label}</h3>
                        {selectedFormat === format.value && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{format.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Continue button at bottom */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleContinue}
          disabled={!selectedType || !selectedFormat}
          className={`gap-1 ${
            selectedType && selectedFormat ? 'bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple' : ''
          }`}
        >
          Continue
          {selectedType && selectedFormat && (
            <CheckCircle className="h-4 w-4 ml-1" />
          )}
        </Button>
      </div>
    </div>
  );
};
