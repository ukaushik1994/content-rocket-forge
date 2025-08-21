import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, CheckCircle, Edit3, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AIServiceController from '@/services/aiService/AIServiceController';
import { EnhancedSolution } from '@/contexts/content-builder/types';

interface DialogContentGeneratorProps {
  proposal: any;
  selectedSolution: EnhancedSolution | null;
  outline: string[];
  onContentGenerated: (content: string) => void;
  generatedContent: string;
  contentTitle: string;
  onTitleChange: (title: string) => void;
}

export function DialogContentGenerator({ 
  proposal, 
  selectedSolution, 
  outline,
  onContentGenerated,
  generatedContent,
  contentTitle,
  onTitleChange
}: DialogContentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');

  const handleGenerateContent = async () => {
    if (!selectedSolution || outline.length === 0) {
      toast({
        title: "Missing requirements",
        description: "Please ensure you have selected a solution and generated an outline",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      const prompt = createContentPrompt();
      
      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'content_generation',
        temperature: 0.7,
        max_tokens: 4000
      });
      
      if (response?.content) {
        onContentGenerated(response.content);
        toast({
          title: "Content Generated",
          description: "Your content has been successfully created"
        });
      } else {
        throw new Error('No content generated');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please check your AI configuration.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const createContentPrompt = () => {
    const primaryKeyword = proposal?.primary_keyword || '';
    const secondaryKeywords = proposal?.secondary_keywords || [];
    const outlineText = outline.map((section, index) => `${index + 1}. ${section}`).join('\n');
    
    const solutionContext = `
Solution Name: ${selectedSolution?.name}
Features: ${selectedSolution?.features.join(', ')}
Use Cases: ${selectedSolution?.useCases.join(', ')}
Target Audience: ${selectedSolution?.targetAudience.join(', ')}
Pain Points Addressed: ${selectedSolution?.painPoints.join(', ')}
`;

    return `
Write a comprehensive, high-quality article based on the following outline and solution context:

Title: ${contentTitle}
Primary keyword: ${primaryKeyword}
Secondary keywords: ${secondaryKeywords.join(', ')}

Article Outline:
${outlineText}

Solution to Feature:
${solutionContext}

Requirements:
1. Write engaging, informative content for each section
2. Naturally integrate the solution throughout the article
3. Include specific features, use cases, and benefits
4. Address target audience pain points
5. Use a professional yet approachable tone
6. Include actionable insights and practical tips
7. Optimize for SEO with natural keyword integration
8. Aim for 1500-2500 words total
9. Use proper markdown formatting for headings and structure

Write the complete article content now:
`;
  };

  const handleEditContent = () => {
    setEditableContent(generatedContent);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onContentGenerated(editableContent);
    setIsEditing(false);
    toast({
      title: "Content Updated",
      description: "Your changes have been saved"
    });
  };

  const hasContent = generatedContent.length > 0;
  const wordCount = generatedContent.split(/\s+/).filter(word => word.length > 0).length;

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
            value={contentTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter your content title..."
            className="text-lg"
          />
        </CardContent>
      </Card>

      {/* Outline Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Content Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
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

      {/* Solution Integration Preview */}
      {selectedSolution && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Solution Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-primary">Solution:</span>
                <span className="text-sm ml-2">{selectedSolution.name}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs font-medium text-primary">Key Features:</span>
                {selectedSolution.features.slice(0, 3).map((feature, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEditContent}
                  className="gap-2"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit
                </Button>
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
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="Edit your content here..."
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm font-sans">
                    {generatedContent}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}