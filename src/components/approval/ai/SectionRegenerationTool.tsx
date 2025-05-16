
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText, Check } from 'lucide-react';
import { useApproval } from '../context/ApprovalContext';
import { ContentItemType } from '@/contexts/content/types';
import { toast } from 'sonner';

interface Section {
  id: string;
  title: string;
  content: string;
  isHeading: boolean;
  level: number;
}

interface SectionRegenerationToolProps {
  content: ContentItemType;
  onSectionRegenerated: (updatedContent: string) => void;
  className?: string;
}

export const SectionRegenerationTool: React.FC<SectionRegenerationToolProps> = ({
  content,
  onSectionRegenerated,
  className = ''
}) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratedContent, setRegeneratedContent] = useState<string | null>(null);
  
  const { regenerateContentSection } = useApproval();

  useEffect(() => {
    if (content?.content) {
      parseSections(content.content);
    }
  }, [content]);

  const parseSections = (contentText: string) => {
    const lines = contentText.split('\n');
    const parsedSections: Section[] = [];
    let currentSection: Section | null = null;
    let sectionId = 0;

    lines.forEach((line, index) => {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headingMatch) {
        // If we've been building a section, save it
        if (currentSection) {
          parsedSections.push(currentSection);
        }
        
        // Start a new section with this heading
        const level = headingMatch[1].length;
        currentSection = {
          id: `section-${++sectionId}`,
          title: headingMatch[2],
          content: line,
          isHeading: true,
          level
        };
      } else if (currentSection) {
        // Add to existing section
        currentSection.content += '\n' + line;
      } else {
        // Start with a non-heading section
        currentSection = {
          id: `section-${++sectionId}`,
          title: 'Introduction',
          content: line,
          isHeading: false,
          level: 0
        };
      }
    });

    // Add the last section if it exists
    if (currentSection) {
      parsedSections.push(currentSection);
    }

    setSections(parsedSections);
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId === selectedSectionId ? null : sectionId);
    setRegeneratedContent(null); // Clear any previous regenerated content
  };

  const handleRegenerateSection = async () => {
    if (!selectedSectionId) return;
    
    const selectedSection = sections.find(section => section.id === selectedSectionId);
    if (!selectedSection) return;
    
    setIsRegenerating(true);
    try {
      const newContent = await regenerateContentSection(
        content,
        selectedSection.content,
        selectedSection.title
      );
      
      setRegeneratedContent(newContent);
    } catch (error) {
      console.error('Failed to regenerate section:', error);
      toast.error('Failed to regenerate content section');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleApplyRegeneration = () => {
    if (!selectedSectionId || !regeneratedContent) return;
    
    const selectedIndex = sections.findIndex(section => section.id === selectedSectionId);
    if (selectedIndex === -1) return;
    
    const newSections = [...sections];
    newSections[selectedIndex] = {
      ...newSections[selectedIndex],
      content: regeneratedContent
    };
    
    // Rebuild the full content
    const updatedContent = newSections.map(section => section.content).join('\n');
    onSectionRegenerated(updatedContent);
    
    // Reset the state
    setRegeneratedContent(null);
    toast.success('Section content updated successfully');
  };

  if (sections.length === 0) {
    return (
      <Card className={`border-white/10 bg-white/5 ${className}`}>
        <CardContent className="py-6">
          <div className="flex flex-col items-center justify-center">
            <FileText className="h-8 w-8 text-white/30 mb-2" />
            <p className="text-white/50 text-center">No sections found in content</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-white/10 bg-gradient-to-br from-blue-900/20 to-black/20 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-2 border-b border-white/10">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-neon-blue" /> 
          AI Section Regeneration
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
          {sections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className={`
                p-2 rounded cursor-pointer transition-all
                ${selectedSectionId === section.id ? 'bg-neon-blue/20 border border-neon-blue/30' : 'hover:bg-white/5'}
              `}
              onClick={() => handleSectionSelect(section.id)}
            >
              <p className={`text-sm truncate ${section.isHeading ? 'font-medium' : ''}`}>
                {section.isHeading ? (
                  <span className="opacity-70">{'\u2022'.repeat(section.level)} </span>
                ) : null}
                {section.title}
              </p>
            </motion.div>
          ))}
        </div>

        <Separator className="my-4 bg-white/10" />
        
        <div className="space-y-3">
          {selectedSectionId ? (
            <>
              {regeneratedContent ? (
                <div className="space-y-2">
                  <p className="text-xs text-white/70">AI-generated replacement:</p>
                  <div className="bg-white/5 border border-white/10 rounded-md p-3 text-sm max-h-[150px] overflow-y-auto">
                    {regeneratedContent.split('\n').map((line, i) => (
                      <p key={i} className="mb-1">{line}</p>
                    ))}
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRegeneratedContent(null)}
                      className="bg-white/5 border-white/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleApplyRegeneration}
                      className="bg-gradient-to-r from-neon-blue to-neon-purple"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Apply Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleRegenerateSection}
                  disabled={isRegenerating}
                  className="w-full bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-purple hover:to-neon-blue"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isRegenerating ? 'Regenerating...' : 'Regenerate Selected Section'}
                </Button>
              )}
            </>
          ) : (
            <p className="text-xs text-white/50 text-center">Select a section to regenerate with AI</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
