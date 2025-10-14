import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, RefreshCw, Edit } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { OutlineSection } from '@/contexts/content-builder/types';
import { ActiveProviderIndicator } from '@/components/ai/ActiveProviderIndicator';
import AIServiceController from '@/services/aiService/AIServiceController';

interface ContentGeneratorProps {
  outline: OutlineSection[];
  solution?: { name: string; features?: string[] } | null;
  serpSelections?: Array<{ type: string; content: string }>;
  mainKeyword: string;
  additionalInstructions?: string;
  onContentGenerated?: (content: string) => void;
}

interface GenerationProgress {
  stage: string;
  progress: number;
  currentSection?: number;
  totalSections?: number;
}

export function ContentGenerator({
  outline,
  solution,
  serpSelections = [],
  mainKeyword,
  additionalInstructions = '',
  onContentGenerated
}: ContentGeneratorProps) {
  const { state, setContent } = useContentBuilder();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(state.content || '');
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    stage: 'idle',
    progress: 0
  });
  const [streamingContent, setStreamingContent] = useState('');

  // Calculate word count
  const wordCount = generatedContent ? generatedContent.trim().split(/\s+/).length : 0;

  // Calculate quality indicators
  const keywordDensity = generatedContent 
    ? (generatedContent.toLowerCase().split(mainKeyword.toLowerCase()).length - 1) / wordCount * 100
    : 0;

  const handleGenerateContent = async () => {
    if (!mainKeyword || outline.length === 0) {
      toast.error('Please provide a keyword and outline first');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress({ stage: 'Planning structure...', progress: 10 });
    setStreamingContent('');

    try {
      // Format outline for AI
      const formattedOutline = outline
        .map((section, index) => `${index + 1}. ${section.title}${section.content ? `: ${section.content}` : ''}`)
        .join('\n');

      // Build context from SERP selections
      const serpContext = serpSelections.length > 0
        ? `\n\nSERP Research Insights:\n${serpSelections.map(s => `- ${s.type}: ${s.content}`).join('\n')}`
        : '';

      // Build solution context
      const solutionContext = solution
        ? `\n\nFeatured Solution: ${solution.name}${solution.features ? `\nKey Features: ${solution.features.join(', ')}` : ''}`
        : '';

      const prompt = `Create comprehensive content about "${mainKeyword}".

OUTLINE:
${formattedOutline}
${serpContext}
${solutionContext}

REQUIREMENTS:
- Follow the outline structure exactly
- Include relevant examples and explanations
- Write in an engaging, informative style
- Target approximately 2000-3000 words
- Use proper markdown formatting (headings, lists, bold, etc.)
${additionalInstructions ? `\nADDITIONAL INSTRUCTIONS:\n${additionalInstructions}` : ''}

Generate the complete content now:`;

      setGenerationProgress({ stage: 'Generating content...', progress: 50 });
      
      // Generate content
      const response = await AIServiceController.generate('content_generation', undefined, prompt);
      
      if (response?.content) {
        setGenerationProgress({ stage: 'Finalizing...', progress: 100 });
        setGeneratedContent(response.content);
        setContent(response.content);
        if (onContentGenerated) {
          onContentGenerated(response.content);
        }
        toast.success(`Content generated! ${response.content.trim().split(/\s+/).length} words`);
      } else {
        throw new Error('No content returned from AI');
      }
      
      setIsGenerating(false);

    } catch (error) {
      console.error('Content generation error:', error);
      toast.error('Failed to generate content');
      setIsGenerating(false);
    }
  };

  const handleRegenerateSection = async (sectionIndex: number) => {
    toast.info('Section regeneration coming soon!');
  };

  return (
    <div className="space-y-6">
      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Content Generator
            </span>
            <ActiveProviderIndicator />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Context Summary */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Keyword</p>
              <p className="font-medium">{mainKeyword}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Outline Sections</p>
              <p className="font-medium">{outline.length} sections</p>
            </div>
            <div>
              <p className="text-muted-foreground">SERP Insights</p>
              <p className="font-medium">{serpSelections.length} items</p>
            </div>
          </div>

          {solution && (
            <div className="p-3 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Featured Solution</p>
              <p className="font-medium">{solution.name}</p>
            </div>
          )}

          {/* Generation Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{generationProgress.stage}</span>
                {generationProgress.currentSection && (
                  <span className="text-muted-foreground">
                    Section {generationProgress.currentSection}/{generationProgress.totalSections}
                  </span>
                )}
              </div>
              <Progress value={generationProgress.progress} className="h-2" />
            </div>
          )}

          {/* Generate Button */}
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateContent}
              disabled={isGenerating || outline.length === 0}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : generatedContent ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate Content
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Preview */}
      {(generatedContent || streamingContent) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Content</span>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <Badge variant="secondary">{wordCount} words</Badge>
                  <Badge variant="secondary">
                    {keywordDensity.toFixed(1)}% keyword density
                  </Badge>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{streamingContent || generatedContent}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
