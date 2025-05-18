
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getPromptTemplatesByType } from '@/services/userPreferencesService';
import { FormatGrid, GeneratedContentView, FormatSelector } from './repurpose';
import { contentFormats } from '@/components/content-repurposing/formats';

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
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content Repurposing</CardTitle>
          <CardDescription>
            Transform your content into different formats for various platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormatGrid
            selectedContentTypes={selectedContentTypes}
            availableTemplates={availableTemplates}
            onToggle={handleContentTypeToggle}
            onSelectAll={handleSelectAll}
          />
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
            <FormatSelector 
              generatedContents={generatedContents}
              activeFormat={activeFormat}
              onSelectFormat={setActiveFormat}
            />
          </div>
          
          <GeneratedContentView
            generatedContents={generatedContents}
            activeFormat={activeFormat}
            title={title}
            onCopy={copyToClipboard}
            onDownload={downloadAsText}
          />
        </div>
      )}
    </div>
  );
};

export default RepurposeTab;
