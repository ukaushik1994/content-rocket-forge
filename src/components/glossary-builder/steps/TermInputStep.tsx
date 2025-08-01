import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DomainAnalysisMode } from '../term-input/DomainAnalysisMode';
import { TopicSuggestionMode } from '../term-input/TopicSuggestionMode';
import { ManualBulkMode } from '../term-input/ManualBulkMode';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { Globe, Lightbulb, Edit3 } from 'lucide-react';

interface TermInputStepProps {
  onStepComplete: () => void;
}

export function TermInputStep({ onStepComplete }: TermInputStepProps) {
  const { state } = useGlossaryBuilder();
  const [activeTab, setActiveTab] = useState("domain");

  const inputMethods = [
    {
      id: "domain",
      name: "Domain Analysis",
      description: "Analyze a website to extract relevant terms",
      icon: Globe,
      badge: "AI-Powered"
    },
    {
      id: "topic", 
      name: "Topic Suggestions",
      description: "Get AI-suggested terms for any topic",
      icon: Lightbulb,
      badge: "Smart"
    },
    {
      id: "manual",
      name: "Manual Entry",
      description: "Bulk import or manually add terms",
      icon: Edit3,
      badge: "Flexible"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-holographic">
            Add Terms to Your Glossary
          </CardTitle>
          <p className="text-muted-foreground">
            Choose how you'd like to add terms to your glossary. You can use multiple methods to build a comprehensive term list.
          </p>
        </CardHeader>
      </Card>

      {/* Input Method Selection */}
      <Card className="glass-card border-white/20">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass-panel p-1">
              {inputMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <TabsTrigger 
                    key={method.id}
                    value={method.id}
                    className="flex flex-col gap-2 py-4 data-[state=active]:glass-card data-[state=active]:border data-[state=active]:border-primary/30"
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium">{method.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {method.badge}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="mt-6">
              <TabsContent value="domain" className="space-y-4 m-0">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Domain Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter a website URL to automatically extract relevant terms and concepts for your glossary.
                  </p>
                </div>
                <DomainAnalysisMode />
              </TabsContent>

              <TabsContent value="topic" className="space-y-4 m-0">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Topic-Based Suggestions</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter a topic or industry and get AI-powered term suggestions specific to your field.
                  </p>
                </div>
                <TopicSuggestionMode />
              </TabsContent>

              <TabsContent value="manual" className="space-y-4 m-0">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Manual Entry</h3>
                  <p className="text-sm text-muted-foreground">
                    Add terms manually or import them from a CSV file for complete control over your glossary.
                  </p>
                </div>
                <ManualBulkMode />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Current Terms Preview */}
      {state.suggestedTerms.length > 0 && (
        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Terms Added</h3>
              <Badge variant="default" className="bg-primary/20 text-primary">
                {state.suggestedTerms.length} terms
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {state.suggestedTerms.slice(0, 10).map((term, index) => (
                <Badge key={index} variant="outline" className="glass-card border-white/20">
                  {term}
                </Badge>
              ))}
              {state.suggestedTerms.length > 10 && (
                <Badge variant="secondary" className="text-muted-foreground">
                  +{state.suggestedTerms.length - 10} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}