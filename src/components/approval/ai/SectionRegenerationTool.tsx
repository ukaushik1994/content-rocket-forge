
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentItemType } from '@/contexts/content/types';
import { Wand2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SectionRegenerationToolProps {
  content: ContentItemType;
  onSectionRegenerated: (updatedContent: string) => void;
}

export const SectionRegenerationTool: React.FC<SectionRegenerationToolProps> = ({ 
  content, 
  onSectionRegenerated 
}) => {
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [tone, setTone] = useState('professional');
  
  // Parse content to find sections
  const findSections = () => {
    if (!content.content) return [];
    
    const lines = content.content.split('\n');
    const sections: {title: string, index: number}[] = [];
    
    lines.forEach((line, index) => {
      if (line.startsWith('# ')) {
        sections.push({ title: line.substring(2), index });
      } else if (line.startsWith('## ')) {
        sections.push({ title: line.substring(3), index });
      }
    });
    
    return sections;
  };
  
  const sections = findSections();
  
  const handleRegenerate = async () => {
    if (!selectedSection) {
      toast.error('Please select a section to regenerate');
      return;
    }
    
    setIsRegenerating(true);
    
    try {
      // This would connect to an AI service in a real app
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Find the selected section in the content
      const sectionIndex = sections.find(s => s.title === selectedSection)?.index;
      
      if (sectionIndex !== undefined && content.content) {
        const contentLines = content.content.split('\n');
        let startIndex = sectionIndex;
        let endIndex = contentLines.length;
        
        // Find the end of the section (next heading or end of content)
        for (let i = startIndex + 1; i < contentLines.length; i++) {
          if (contentLines[i].startsWith('#')) {
            endIndex = i;
            break;
          }
        }
        
        // Generate new content for the section
        const newSectionContent = `${contentLines[startIndex]}\n\nThis is regenerated content for the "${selectedSection}" section using the ${tone} tone. In a real app, this would be AI-generated content that matches the selected tone and style preferences while maintaining SEO optimization.\n\nThe content would be well-structured with proper paragraphs and might include relevant statistics, examples, and actionable advice.`;
        
        // Replace the section content
        const updatedContent = [
          ...contentLines.slice(0, startIndex),
          newSectionContent,
          ...contentLines.slice(endIndex)
        ].join('\n');
        
        onSectionRegenerated(updatedContent);
        toast.success(`"${selectedSection}" section regenerated successfully`);
      }
    } catch (error) {
      console.error('Error regenerating section:', error);
      toast.error('Failed to regenerate section');
    } finally {
      setIsRegenerating(false);
    }
  };
  
  return (
    <div className="border-border/50 bg-background/80 backdrop-blur-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Wand2 className="h-3 w-3 text-primary" />
          <h3 className="text-xs font-medium">Section Tools</h3>
          <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded ml-auto">⌘3</kbd>
        </div>
      </div>
      
      <div className="p-3 space-y-3">
        <div className="space-y-1">
          <Label htmlFor="section" className="text-xs">Section</Label>
          <Select 
            value={selectedSection} 
            onValueChange={setSelectedSection}
          >
            <SelectTrigger id="section" className="h-7 text-xs">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map(section => (
                <SelectItem key={section.index} value={section.title} className="text-xs">
                  {section.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <Label className="text-xs">Tone</Label>
          <Tabs defaultValue="professional" value={tone} onValueChange={setTone}>
            <TabsList className="grid grid-cols-3 h-6">
              <TabsTrigger value="professional" className="text-xs h-5">Pro</TabsTrigger>
              <TabsTrigger value="conversational" className="text-xs h-5">Conv</TabsTrigger>
              <TabsTrigger value="persuasive" className="text-xs h-5">Pers</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <Button 
          className="w-full h-7 text-xs"
          onClick={handleRegenerate}
          disabled={isRegenerating || !selectedSection}
        >
          {isRegenerating ? (
            <>
              <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <Wand2 className="mr-1 h-3 w-3" />
              Regenerate
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
