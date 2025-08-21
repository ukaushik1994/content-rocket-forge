import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, CheckCircle, Edit3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AIServiceController from '@/services/aiService/AIServiceController';
import { EnhancedSolution } from '@/contexts/content-builder/types';

interface DialogOutlineGeneratorProps {
  proposal: any;
  selectedSolution: EnhancedSolution | null;
  onOutlineGenerated: (outline: string[]) => void;
  generatedOutline: string[];
}

export function DialogOutlineGenerator({ 
  proposal, 
  selectedSolution, 
  onOutlineGenerated,
  generatedOutline 
}: DialogOutlineGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editableOutline, setEditableOutline] = useState('');

  const handleGenerateOutline = async () => {
    if (!selectedSolution) {
      toast({
        title: "No solution selected",
        description: "Please select a solution first",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      const prompt = createOutlinePrompt();
      
      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'outline_generation',
        temperature: 0.7,
        max_tokens: 1500
      });
      
      if (response?.content) {
        const outline = parseOutline(response.content);
        onOutlineGenerated(outline);
        toast({
          title: "Outline Generated",
          description: `Created ${outline.length} sections for your content`
        });
      } else {
        throw new Error('No content generated');
      }
    } catch (error) {
      console.error('Error generating outline:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate outline. Please check your AI configuration.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const createOutlinePrompt = () => {
    const primaryKeyword = proposal?.primary_keyword || '';
    const secondaryKeywords = proposal?.secondary_keywords || [];
    const solutionContext = `
Solution: ${selectedSolution?.name}
Features: ${selectedSolution?.features.slice(0, 5).join(', ')}
Use Cases: ${selectedSolution?.useCases.slice(0, 3).join(', ')}
Target Audience: ${selectedSolution?.targetAudience.slice(0, 3).join(', ')}
`;

    return `
Create a comprehensive content outline for an article about "${primaryKeyword}" that naturally integrates the following solution:

${solutionContext}

Primary keyword: ${primaryKeyword}
Secondary keywords: ${secondaryKeywords.join(', ')}

Strategy Context:
- Title: ${proposal?.title || 'Strategic Content'}
- Description: ${proposal?.description || ''}
- Priority: ${proposal?.priority_tag || 'high'}

${customInstructions ? `Additional instructions: ${customInstructions}` : ''}

Requirements:
1. Create 6-8 main sections with descriptive headings
2. Naturally integrate the solution throughout relevant sections
3. Address the target audience's pain points and use cases
4. Optimize for search intent around the primary keyword
5. Include actionable insights and practical guidance
6. Ensure smooth narrative flow between sections

Return ONLY the outline in this exact format:
1. [First Section Title]
2. [Second Section Title]
3. [Third Section Title]
(and so on)
`;
  };

  const parseOutline = (outlineText: string): string[] => {
    return outlineText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.match(/^\d+\.\s/) || line.match(/^[IVX]+\.\s/))
      .map(line => line.replace(/^\d+\.\s/, '').replace(/^[IVX]+\.\s/, ''));
  };

  const handleEditOutline = () => {
    setEditableOutline(generatedOutline.join('\n'));
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const editedOutline = editableOutline
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    onOutlineGenerated(editedOutline);
    setIsEditing(false);
    toast({
      title: "Outline Updated",
      description: "Your changes have been saved"
    });
  };

  const hasOutline = generatedOutline.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Generate Content Outline</h3>
        <p className="text-muted-foreground">
          Create a structured outline for "{proposal?.primary_keyword}" featuring {selectedSolution?.name}
        </p>
      </div>

      {/* Solution Context */}
      {selectedSolution && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Selected Solution Context</CardTitle>
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

      {/* Custom Instructions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Additional Instructions (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Any specific requirements or focus areas for the outline..."
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Generate Button */}
      {!hasOutline && (
        <div className="text-center">
          <Button 
            onClick={handleGenerateOutline}
            disabled={isGenerating || !selectedSolution}
            size="lg"
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Outline...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate AI Outline
              </>
            )}
          </Button>
        </div>
      )}

      {/* Generated Outline */}
      {hasOutline && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Generated Outline
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEditOutline}
                  className="gap-2"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleGenerateOutline}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  <Sparkles className="h-3 w-3" />
                  Regenerate
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={editableOutline}
                  onChange={(e) => setEditableOutline(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  placeholder="Edit your outline here..."
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
              <ol className="space-y-2">
                {generatedOutline.map((section, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="font-mono text-sm text-muted-foreground min-w-[2rem]">
                      {index + 1}.
                    </span>
                    <span className="text-sm">{section}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}