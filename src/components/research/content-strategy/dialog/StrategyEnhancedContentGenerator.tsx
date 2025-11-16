import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StrategyEnhancedContentGeneratorProps {
  proposal: any;
}

export function StrategyEnhancedContentGenerator({ proposal }: StrategyEnhancedContentGeneratorProps) {
  const { 
    state, 
    generateContent, 
    setContentTitle,
    setContent,
    setAdditionalInstructions 
  } = useContentBuilder();
  
  const { 
    selectedSolution, 
    outline, 
    content, 
    contentTitle,
    isGenerating,
    serpSelections
  } = state;

  const handleGenerateContent = async () => {
    if (!selectedSolution || outline.length === 0) {
      toast({
        title: "Missing requirements",
        description: "Please ensure you have selected a solution and generated an outline",
        variant: "destructive"
      });
      return;
    }

    // Enhanced content generation with strategy context
    try {
      // Convert outline to OutlineSection format for generateContent
      const outlineSections = outline.map((item, index) => ({
        id: `section-${index}`,
        title: item,
        level: 1,
        content: '',
        order: index,
        isExpanded: false
      }));

      // Add strategy-specific instructions to content generation
      const strategyInstructions = [
        `Primary focus: ${proposal?.primary_keyword}`,
        selectedSolution ? `Featured solution: ${selectedSolution.name}` : '',
        serpSelections.length > 0 ? `Incorporate insights from ${serpSelections.length} SERP research items` : '',
        proposal?.priority_tag ? `Content priority: ${proposal.priority_tag}` : '',
        'Ensure content addresses user search intent and provides actionable value',
        'Integrate the solution naturally throughout relevant sections',
        'Include specific examples and use cases where appropriate'
      ].filter(Boolean).join('\n- ');

      // Merge strategy instructions with existing user instructions instead of replacing
      const mergedInstructions = [
        state.additionalInstructions,
        '\n\n=== Strategy Context ===\n',
        strategyInstructions
      ].filter(Boolean).join('');
      
      setAdditionalInstructions(mergedInstructions);

      await generateContent(outlineSections);

      // Calculate word count AFTER generation completes
      const generatedWordCount = state.content.split(/\s+/).filter(word => word.length > 0).length;
      toast({
        title: "Content Generated",
        description: `Successfully created ${generatedWordCount > 0 ? generatedWordCount + ' word' : ''} strategy-focused content`,
      });

    } catch (error: any) {
      console.error('Enhanced content generation failed:', error);
      
      // Specific error handling for better user feedback
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        toast({
          title: "Rate Limit Exceeded",
          description: "Too many requests. Please wait a moment and try again.",
          variant: "destructive"
        });
      } else if (error.message?.includes('API key') || error.message?.includes('401') || error.message?.includes('403')) {
        toast({
          title: "Configuration Error",
          description: "AI service not properly configured. Check your settings.",
          variant: "destructive"
        });
      } else if (error.message?.includes('402') || error.message?.includes('credits')) {
        toast({
          title: "Configuration Error",
          description: "Please check your AI provider configuration in Settings.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Generation Failed",
          description: error.message || "Unknown error. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const selectedSerpCount = serpSelections.filter(item => item.selected).length;
  const hasContent = content && content.length > 0;
  const wordCount = hasContent ? content.split(/\s+/).filter(word => word.length > 0).length : 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Generate Content</h3>
        <p className="text-muted-foreground">
          Create compelling content about "{proposal?.primary_keyword}" featuring {selectedSolution?.name}
        </p>
      </div>

      {/* Content Title */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Content Title</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={contentTitle || ''}
            onChange={(e) => setContentTitle(e.target.value)}
            placeholder="Enter your content title..."
            className="text-lg"
          />
        </CardContent>
      </Card>

      {/* Generation Context Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Solution</span>
              <Badge variant="default">{selectedSolution?.name || 'None'}</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Outline Sections</span>
              <Badge variant="default">{outline.length}</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">SERP Research</span>
              <Badge variant="default">{selectedSerpCount} items</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outline Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Content Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {outline.map((section, index) => (
              <div key={index} className="text-sm flex items-start gap-2">
                <span className="font-mono text-muted-foreground min-w-[2rem]">
                  {index + 1}.
                </span>
                <span>{section}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      {!hasContent && (
        <div className="text-center">
          <Button 
            onClick={handleGenerateContent}
            disabled={isGenerating || !selectedSolution || outline.length === 0}
            size="lg"
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
        </div>
      )}

      {/* Generated Content */}
      {hasContent && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Generated Content
                <Badge variant="outline" className="text-xs">
                  {wordCount} words
                </Badge>
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGenerateContent}
                disabled={isGenerating}
                className="gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                Regenerate
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm font-sans">
                  {content}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}