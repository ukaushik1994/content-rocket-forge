
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentItemType } from '@/contexts/content/types';
import { Wand2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AIServiceController from '@/services/aiService/AIServiceController';

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
        
        // Extract current section content
        const currentSectionContent = contentLines.slice(startIndex, endIndex).join('\n');
        
        // Build AI prompt
        const systemPrompt = `You are a professional content writer tasked with regenerating a section of content. 
Maintain the section heading and structure, but rewrite the content with a ${tone} tone.
Focus on clarity, engagement, and SEO optimization while preserving the core message.`;
        
        const userPrompt = `Regenerate this section with a ${tone} tone:\n\n${currentSectionContent}\n\nProvide only the regenerated section content, starting with the heading.`;
        
        // Call AI service
        const result = await AIServiceController.generate(
          'content_improvement',
          systemPrompt,
          userPrompt,
          { 
            temperature: 0.7,
            maxTokens: 2000
          }
        );
        
        if (!result?.content) {
          throw new Error('No content generated');
        }
        
        // Replace the section content
        const updatedContent = [
          ...contentLines.slice(0, startIndex),
          result.content.trim(),
          ...contentLines.slice(endIndex)
        ].join('\n');
        
        onSectionRegenerated(updatedContent);
        toast.success(`"${selectedSection}" section regenerated successfully`);
      }
    } catch (error) {
      console.error('Error regenerating section:', error);
      toast.error('Failed to regenerate section. Please check AI provider settings.');
    } finally {
      setIsRegenerating(false);
    }
  };
  
  return (
    <Card className="border-white/10 bg-black/20 backdrop-blur-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-neon-purple" />
          <h3 className="text-sm font-medium">Section Regeneration</h3>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="section">Select section to regenerate</Label>
          <Select 
            value={selectedSection} 
            onValueChange={setSelectedSection}
          >
            <SelectTrigger id="section" className="bg-white/5 border-white/10">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/10">
              {sections.map(section => (
                <SelectItem key={section.index} value={section.title}>
                  {section.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Content tone</Label>
          <Tabs defaultValue="professional" value={tone} onValueChange={setTone}>
            <TabsList className="grid grid-cols-3 bg-white/5">
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="conversational">Conversational</TabsTrigger>
              <TabsTrigger value="persuasive">Persuasive</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <Button 
          className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
          onClick={handleRegenerate}
          disabled={isRegenerating || !selectedSection}
        >
          {isRegenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Regenerate Section
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
