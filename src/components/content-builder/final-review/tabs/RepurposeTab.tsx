
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Copy, Twitter, Linkedin, Mail, Video, Headphones, Image } from 'lucide-react';
import { toast } from 'sonner';

interface RepurposeTabProps {
  content: string;
  title: string;
  isGenerating?: boolean;
  onGenerateRepurposedContent?: (contentType: string) => Promise<void>;
}

export const RepurposeTab: React.FC<RepurposeTabProps> = ({
  content,
  title,
  isGenerating = false,
  onGenerateRepurposedContent = async () => {}
}) => {
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [repurposedContent, setRepurposedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const contentTypes = [
    { id: 'social-twitter', name: 'Twitter/X Post', icon: Twitter },
    { id: 'social-linkedin', name: 'LinkedIn Post', icon: Linkedin },
    { id: 'email-newsletter', name: 'Email Newsletter', icon: Mail },
    { id: 'video-script', name: 'Video Script', icon: Video },
    { id: 'podcast-script', name: 'Podcast Script', icon: Headphones },
    { id: 'infographic', name: 'Infographic Content', icon: Image },
  ];
  
  const handleContentTypeChange = (value: string) => {
    setSelectedContentType(value);
    setRepurposedContent(''); // Reset when changing type
  };
  
  const handleGenerateContent = async () => {
    if (!selectedContentType) {
      toast.error('Please select a content type first');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onGenerateRepurposedContent(selectedContentType);
      
      // Mock content generation for demonstration
      // In a real implementation, this would come from the AI generation service
      const mockContent = `This is a repurposed version of "${title}" for ${
        contentTypes.find(type => type.id === selectedContentType)?.name
      }.\n\nThe original content has been transformed to fit this format...\n\n${
        content.substring(0, 200)
      }...(transformed for ${selectedContentType})`;
      
      setRepurposedContent(mockContent);
      toast.success(`Generated ${
        contentTypes.find(type => type.id === selectedContentType)?.name
      } content`);
    } catch (error) {
      console.error('Error generating repurposed content:', error);
      toast.error('Failed to generate repurposed content');
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(repurposedContent);
    toast.success('Copied to clipboard');
  };
  
  const saveAsDraft = () => {
    // In a real implementation, this would save the repurposed content as a new draft
    toast.success('Saved as new draft');
  };

  // Find the selected content type object
  const selectedType = contentTypes.find(type => type.id === selectedContentType);
  
  // Create a component for the icon
  const SelectedIcon = selectedType?.icon;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Content Repurposing</CardTitle>
          <CardDescription>
            Transform your content into different formats for various platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3">
              <Select value={selectedContentType} onValueChange={handleContentTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Social Media</SelectLabel>
                    {contentTypes.filter(type => type.id.startsWith('social')).map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center">
                          {React.createElement(type.icon, { className: "h-4 w-4 mr-2" })}
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Long-form</SelectLabel>
                    {contentTypes.filter(type => !type.id.startsWith('social')).map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center">
                          {React.createElement(type.icon, { className: "h-4 w-4 mr-2" })}
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleGenerateContent} 
                className="mt-4 w-full"
                disabled={isLoading || !selectedContentType}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
              
              {selectedContentType && selectedType && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Selected format:</p>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {SelectedIcon && <SelectedIcon className="h-3 w-3" />}
                    {selectedType.name}
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="w-full md:w-2/3">
              {repurposedContent ? (
                <div className="border rounded-md p-4 h-full bg-card/50">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">Generated Content</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                        <Copy className="h-3 w-3 mr-1" /> Copy
                      </Button>
                      <Button size="sm" variant="outline" onClick={saveAsDraft}>
                        Save as Draft
                      </Button>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap text-sm mt-2">
                    {repurposedContent}
                  </div>
                </div>
              ) : (
                <div className="border border-dashed rounded-md p-6 h-full flex items-center justify-center">
                  {isLoading ? (
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                      <p className="text-muted-foreground">Transforming your content...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-muted-foreground">
                        {selectedContentType 
                          ? "Click 'Generate Content' to transform your content" 
                          : "Select a content type to get started"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
