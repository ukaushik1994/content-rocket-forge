
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckIcon, Loader2, Copy, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { getPromptTemplatesByType } from '@/services/userPreferencesService';

// Content format options
export const contentFormats = [
  { id: 'social-twitter', name: 'Twitter/X Post', description: 'Short-form content under 280 characters' },
  { id: 'social-linkedin', name: 'LinkedIn Post', description: 'Professional content for LinkedIn' },
  { id: 'social-facebook', name: 'Facebook Post', description: 'Engaging content for Facebook' },
  { id: 'email', name: 'Email Newsletter', description: 'Email-ready content with subject line' },
  { id: 'script', name: 'Video/Podcast Script', description: 'Script for audio or video content' },
  { id: 'infographic', name: 'Infographic Content', description: 'Structured content for visual presentation' },
  { id: 'blog', name: 'Blog Summary', description: 'Condensed version of the content' }
];

interface RepurposeTabProps {
  content: string;
  title: string;
  isGenerating: boolean;
  onGenerateRepurposedContent: (contentTypes: string[]) => Promise<void>;
}

export const RepurposeTab: React.FC<RepurposeTabProps> = ({ 
  content, 
  title,
  isGenerating,
  onGenerateRepurposedContent 
}) => {
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [generatedContents, setGeneratedContents] = useState<Record<string, string>>({});
  const [activeFormat, setActiveFormat] = useState<string | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<Record<string, any[]>>({});
  
  // Load available templates for each format type
  useEffect(() => {
    const loadTemplates = () => {
      const templates: Record<string, any[]> = {};
      
      contentFormats.forEach(format => {
        const formatTemplates = getPromptTemplatesByType(format.id);
        if (formatTemplates.length > 0) {
          templates[format.id] = formatTemplates;
        }
      });
      
      setAvailableTemplates(templates);
    };
    
    loadTemplates();
  }, []);
  
  const handleContentTypeToggle = (contentType: string) => {
    if (selectedContentTypes.includes(contentType)) {
      setSelectedContentTypes(selectedContentTypes.filter(type => type !== contentType));
    } else {
      setSelectedContentTypes([...selectedContentTypes, contentType]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedContentTypes.length === contentFormats.length) {
      setSelectedContentTypes([]);
    } else {
      setSelectedContentTypes(contentFormats.map(format => format.id));
    }
  };
  
  const handleGenerate = async () => {
    if (selectedContentTypes.length === 0) {
      toast.error('Please select at least one content format');
      return;
    }
    
    // Call the parent component's generation function
    await onGenerateRepurposedContent(selectedContentTypes);
  };
  
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };
  
  const downloadAsText = (content: string, formatName: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title ? title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'content'}_${formatName.toLowerCase().replace(' ', '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as ${a.download}`);
  };
  
  // Find template info for a specific format
  const getTemplateInfo = (formatId: string) => {
    const templates = availableTemplates[formatId] || [];
    if (templates.length > 0) {
      return `${templates.length} template${templates.length > 1 ? 's' : ''} available`;
    }
    return 'Default template';
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Content Repurposing</span>
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedContentTypes.length === contentFormats.length ? 'Deselect All' : 'Select All'}
            </Button>
          </CardTitle>
          <CardDescription>
            Transform your content into different formats for various platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {contentFormats.map(format => (
              <div 
                key={format.id} 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedContentTypes.includes(format.id) 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleContentTypeToggle(format.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-sm flex items-center justify-center ${
                      selectedContentTypes.includes(format.id) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'border border-muted-foreground'
                    }`}>
                      {selectedContentTypes.includes(format.id) && (
                        <CheckIcon className="h-3 w-3" />
                      )}
                    </div>
                    <span className="font-medium">{format.name}</span>
                  </div>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs">
                        {getTemplateInfo(format.id)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Custom prompt templates available in settings</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{format.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerate}
            disabled={selectedContentTypes.length === 0 || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating {selectedContentTypes.length} format{selectedContentTypes.length !== 1 ? 's' : ''}...
              </>
            ) : (
              <>Generate {selectedContentTypes.length} Selected Format{selectedContentTypes.length !== 1 ? 's' : ''}</>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Generated content section */}
      {Object.keys(generatedContents).length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Generated Content</h3>
            <div className="flex space-x-2">
              {contentFormats
                .filter(format => generatedContents[format.id])
                .map(format => (
                  <Button
                    key={format.id}
                    variant={activeFormat === format.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFormat(format.id)}
                  >
                    {format.name}
                  </Button>
                ))}
            </div>
          </div>
          
          {activeFormat && generatedContents[activeFormat] ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {contentFormats.find(f => f.id === activeFormat)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={generatedContents[activeFormat]}
                  readOnly
                  className="min-h-[200px] font-mono text-sm"
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedContents[activeFormat])}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadAsText(
                    generatedContents[activeFormat], 
                    contentFormats.find(f => f.id === activeFormat)?.name || 'content'
                  )}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="text-center p-12 border border-dashed rounded-lg">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Select a format to view generated content</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
