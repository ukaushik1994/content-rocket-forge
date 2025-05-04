import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Button } from '@/components/ui/button';
import { ContentEditor } from '@/components/content/ContentEditor';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Loader2, 
  CheckCircle, 
  BookOpen, 
  FileCheck,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { SerpContentGenerator } from '@/components/content/SerpContentGenerator';
import { Badge } from '@/components/ui/badge';
import { ContentOutlineSection } from '@/contexts/content-builder/types';

export const ContentWritingStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { 
    mainKeyword, 
    outline, 
    content, 
    additionalInstructions, 
    serpData, 
    selectedSolution,
    contentTitle
  } = state;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState(contentTitle || mainKeyword || '');
  const [saveNote, setSaveNote] = useState('');

  // Mark this step as complete when we have content
  useEffect(() => {
    if (content && content.trim().length > 100) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 4 });
    }
  }, [content]);

  useEffect(() => {
    if (contentTitle && contentTitle !== saveTitle) {
      setSaveTitle(contentTitle);
    }
  }, [contentTitle]);

  const handleContentChange = (newContent: string) => {
    dispatch({ type: 'SET_CONTENT', payload: newContent });
  };

  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: 'SET_ADDITIONAL_INSTRUCTIONS', payload: e.target.value });
  };

  const handleGenerateContent = async () => {
    // In a real app, this would call an AI service to generate content
    // based on the outline, keywords, and additional instructions
    
    setIsGenerating(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, generate a content based on the outline and solution
      const generatedContent = generateDemoContent();
      
      dispatch({ type: 'SET_CONTENT', payload: generatedContent });
      toast.success('Content generated successfully');
      
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateDemoContent = () => {
    // Simple demo content generation based on outline
    let demoContent = contentTitle ? `# ${contentTitle}\n\n` : `# ${mainKeyword}\n\n`;
    
    if (selectedSolution) {
      demoContent += `Are you looking for the best solution for ${mainKeyword}? Look no further than ${selectedSolution.name}. In this comprehensive guide, we'll explore why ${selectedSolution.name} stands out from the competition and how it can transform your approach to ${mainKeyword}.\n\n`;
    } else {
      demoContent += `In this comprehensive guide, we'll explore everything you need to know about ${mainKeyword}, from fundamental concepts to advanced strategies.\n\n`;
    }
    
    if (outline && outline.length > 0) {
      outline.forEach((section: ContentOutlineSection) => {
        demoContent += `## ${section.title}\n\n`;
        
        if (selectedSolution && section.title.includes("Introduction")) {
          demoContent += `${mainKeyword} has become increasingly important in today's landscape. ${selectedSolution.name} offers a unique approach that addresses the common challenges faced by professionals in this field.\n\n`;
        } else if (section.title.includes("Challenges") || section.title.includes("Problems")) {
          demoContent += `When dealing with ${mainKeyword}, many face difficulties such as [challenge 1], [challenge 2], and [challenge 3]. These obstacles can significantly impact your results if not properly addressed.\n\n`;
        } else if (selectedSolution && (section.title.includes("Solutions") || section.title.includes("Benefits"))) {
          demoContent += `${selectedSolution.name} provides several key advantages:\n\n`;
          if (selectedSolution.features && selectedSolution.features.length > 0) {
            selectedSolution.features.forEach(feature => {
              demoContent += `- **${feature}**: This feature helps you overcome common challenges by...\n`;
            });
            demoContent += `\n`;
          } else {
            demoContent += `- **Feature 1**: Description of how this helps with ${mainKeyword}\n`;
            demoContent += `- **Feature 2**: Another key benefit for your ${mainKeyword} strategy\n`;
            demoContent += `- **Feature 3**: How this feature sets ${selectedSolution.name} apart\n\n`;
          }
        } else if (section.title.includes("FAQ") || section.title.includes("Questions")) {
          demoContent += `Here are answers to the most common questions about ${mainKeyword}:\n\n`;
          demoContent += `### Is ${mainKeyword} right for my business?\n\n`;
          demoContent += `Absolutely! ${mainKeyword} can benefit businesses of all sizes by improving...\n\n`;
          demoContent += `### How long does it take to see results with ${mainKeyword}?\n\n`;
          demoContent += `Most businesses start seeing positive outcomes within [timeframe]...\n\n`;
        } else if (section.title.includes("Conclusion")) {
          if (selectedSolution) {
            demoContent += `In conclusion, ${selectedSolution.name} offers a comprehensive solution for ${mainKeyword} that addresses the key challenges faced by professionals. By implementing this powerful tool, you can expect improved results and greater efficiency in your workflow.\n\n`;
            demoContent += `Ready to transform your approach to ${mainKeyword}? [Get started with ${selectedSolution.name} today](#) and experience the difference firsthand.\n\n`;
          } else {
            demoContent += `In this guide, we've covered the essentials of ${mainKeyword}, from basic concepts to advanced strategies. By applying these principles consistently, you'll be well on your way to mastering ${mainKeyword} and achieving your goals.\n\n`;
          }
        } else {
          demoContent += `This section provides detailed information about ${section.title.toLowerCase()}. In a real implementation, this would be generated by an AI writing service based on your outline and SERP analysis.\n\n`;
        }
        
        if (section.subsections && section.subsections.length > 0) {
          section.subsections.forEach(subsection => {
            demoContent += `### ${subsection.title}\n\n`;
            demoContent += `This is detailed content for the ${subsection.title.toLowerCase()} subsection.\n\n`;
          });
        }
      });
    }
    
    return demoContent;
  };
  
  const handleToggleOutline = () => {
    setShowOutline(!showOutline);
  };
  
  const handleToggleGenerator = () => {
    setShowGenerator(!showGenerator);
  };

  const handleContentTemplateSelection = (template: string) => {
    dispatch({ type: 'SET_CONTENT', payload: template });
    setShowGenerator(false);
    toast.success('Content template applied');
  };
  
  const handleSaveToDraft = async () => {
    if (!saveTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Content saved successfully to your repository');
      setShowSaveDialog(false);
      
      // In a real app, this would save to a database
      console.log('Saved content:', {
        title: saveTitle,
        content,
        keyword: mainKeyword,
        note: saveNote
      });
      
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Write Your Content</h3>
          <p className="text-sm text-muted-foreground">
            Create your content based on the generated outline.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleToggleOutline}
          >
            {showOutline ? 'Hide Sidebar' : 'Show Sidebar'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleToggleGenerator}
          >
            <Plus className="h-4 w-4 mr-2" />
            Content Templates
          </Button>
          
          <Button
            onClick={handleGenerateContent}
            disabled={isGenerating || outline.length === 0}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1" />
                Generate Content
              </>
            )}
          </Button>
        </div>
      </div>
      
      {showGenerator && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Content Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <SerpContentGenerator 
              serpData={serpData}
              onGenerateContent={handleContentTemplateSelection}
              mainKeyword={mainKeyword}
            />
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {showOutline && (
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h4 className="text-sm font-medium mb-4">Content Outline</h4>
                
                {outline && outline.length > 0 ? (
                  <div className="space-y-4">
                    {outline.map((section: ContentOutlineSection) => (
                      <div key={section.id} className="space-y-2">
                        <div className="font-medium text-sm">{section.title}</div>
                        
                        {section.subsections && section.subsections.length > 0 && (
                          <ul className="pl-4 space-y-1">
                            {section.subsections.map((subsection) => (
                              <li key={subsection.id} className="text-sm text-muted-foreground list-disc list-inside">
                                {subsection.title}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No outline created yet. Go back to the previous step to create an outline.
                  </p>
                )}
              </CardContent>
            </Card>
            
            {selectedSolution && (
              <Card>
                <CardContent className="pt-6">
                  <h4 className="text-sm font-medium mb-2">Selected Solution</h4>
                  <div className="space-y-2">
                    <div className="font-bold">{selectedSolution.name}</div>
                    {selectedSolution.features && selectedSolution.features.length > 0 && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Features:</div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {selectedSolution.features.map((feature, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Include these features and benefits in your content to highlight this solution.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="additional-instructions">Additional Instructions</Label>
              <Textarea
                id="additional-instructions"
                placeholder="Add any specific instructions for content generation..."
                value={additionalInstructions}
                onChange={handleInstructionsChange}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                These instructions will be used when generating content.
              </p>
            </div>
          </div>
        )}
        
        <div className={showOutline ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {/* Connect to ContentEditor component */}
          <ContentEditor
            content={content}
            onContentChange={handleContentChange}
          />
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Save Content to Repository</DialogTitle>
            <DialogDescription>
              Save your content to access it later from the content repository.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="save-title">Content Title</Label>
              <Input
                id="save-title"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Enter a title for this content"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="save-note">Note (Optional)</Label>
              <Textarea
                id="save-note"
                value={saveNote}
                onChange={(e) => setSaveNote(e.target.value)}
                placeholder="Add any notes or comments about this content"
                rows={3}
              />
            </div>

            <div className="pt-2">
              <Label className="text-xs text-muted-foreground">Content Details</Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium w-24">Main Keyword:</span>
                  <span className="text-xs">{mainKeyword || "None"}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium w-24">Word Count:</span>
                  <span className="text-xs">{content ? content.split(/\s+/).length : 0} words</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium w-24">Sections:</span>
                  <span className="text-xs">{outline.length}</span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline" 
              onClick={() => setShowSaveDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveToDraft}
              disabled={isSaving || !saveTitle.trim()}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4" />
                  Save to Repository
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
