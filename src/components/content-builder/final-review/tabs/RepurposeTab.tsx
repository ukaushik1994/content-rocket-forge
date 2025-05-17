
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Copy, Twitter, Linkedin, Mail, Video, Headphones, Image, Save, Download, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Checkbox } from '@/components/ui/checkbox';

interface RepurposeTabProps {
  content: string;
  title: string;
  isGenerating?: boolean;
  onGenerateRepurposedContent?: (contentTypes: string[]) => Promise<void>;
}

export const RepurposeTab: React.FC<RepurposeTabProps> = ({
  content,
  title,
  isGenerating = false,
  onGenerateRepurposedContent = async () => {}
}) => {
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [repurposedContent, setRepurposedContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeContentType, setActiveContentType] = useState<string | null>(null);
  
  const contentTypes = [
    { id: 'social-twitter', name: 'Twitter/X Post', icon: Twitter },
    { id: 'social-linkedin', name: 'LinkedIn Post', icon: Linkedin },
    { id: 'email-newsletter', name: 'Email Newsletter', icon: Mail },
    { id: 'video-script', name: 'Video Script', icon: Video },
    { id: 'podcast-script', name: 'Podcast Script', icon: Headphones },
    { id: 'infographic', name: 'Infographic Content', icon: Image },
  ];
  
  const handleContentTypeToggle = (contentTypeId: string) => {
    setSelectedContentTypes(prev => {
      if (prev.includes(contentTypeId)) {
        return prev.filter(id => id !== contentTypeId);
      } else {
        return [...prev, contentTypeId];
      }
    });
  };
  
  const handleGenerateContent = async () => {
    if (selectedContentTypes.length === 0) {
      toast.error('Please select at least one content type');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onGenerateRepurposedContent(selectedContentTypes);
      
      // In a real implementation, repurposedContent would be set by the parent component
      // This mock is just for demonstration
      const newRepurposedContent: Record<string, string> = {};
      selectedContentTypes.forEach(contentTypeId => {
        const selectedType = contentTypes.find(type => type.id === contentTypeId);
        newRepurposedContent[contentTypeId] = `This is a repurposed version of "${title}" for ${
          selectedType?.name
        }.\n\nThe original content has been transformed to fit this format...\n\n${
          content.substring(0, 200)
        }...(transformed for ${contentTypeId})`;
      });
      
      setRepurposedContent(newRepurposedContent);
      
      // Set the first content type as active if none is active
      if (!activeContentType && selectedContentTypes.length > 0) {
        setActiveContentType(selectedContentTypes[0]);
      }
      
      toast.success(`Generated content for ${selectedContentTypes.length} format(s)`);
    } catch (error) {
      console.error('Error generating repurposed content:', error);
      toast.error('Failed to generate repurposed content');
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };
  
  const saveAsDraft = (contentType: string) => {
    // In a real implementation, this would save the repurposed content as a new draft
    toast.success(`Saved ${contentTypes.find(t => t.id === contentType)?.name} as new draft`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden backdrop-blur-lg bg-gradient-to-br from-black/40 to-black/60 border border-white/10 shadow-[0_0_15px_rgba(155,135,245,0.1)]">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-xl flex items-center">
              <div className="h-6 w-6 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue flex items-center justify-center mr-2">
                <ChevronRight className="h-3 w-3 text-white" />
              </div>
              <span className="bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
                Multi-Format Content Repurposing
              </span>
            </CardTitle>
            <CardDescription className="text-white/60">
              Transform your content into multiple formats simultaneously with AI assistance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <motion.div variants={itemVariants} className="w-full md:w-1/3 space-y-4">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-white">Select Content Types</p>
                  
                  <div className="space-y-2 p-4 rounded-md bg-black/30 border border-white/10">
                    {contentTypes.map(type => (
                      <div key={type.id} className="flex items-center space-x-2 p-2 hover:bg-white/5 rounded-md transition-colors">
                        <Checkbox 
                          id={`type-${type.id}`}
                          checked={selectedContentTypes.includes(type.id)}
                          onCheckedChange={() => handleContentTypeToggle(type.id)}
                          className="data-[state=checked]:bg-neon-purple data-[state=checked]:border-neon-purple"
                        />
                        <label 
                          htmlFor={`type-${type.id}`}
                          className="flex items-center cursor-pointer text-sm font-medium flex-1"
                        >
                          {React.createElement(type.icon, { className: "h-4 w-4 mr-2 text-white/70" })}
                          {type.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/60">
                      {selectedContentTypes.length} format{selectedContentTypes.length !== 1 ? 's' : ''} selected
                    </p>
                    {selectedContentTypes.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-white/60 hover:text-white hover:bg-white/10"
                        onClick={() => setSelectedContentTypes([])}
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={handleGenerateContent} 
                  className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-purple/90 hover:to-neon-blue/90 shadow-[0_0_15px_rgba(155,135,245,0.2)] transition-all duration-300"
                  disabled={isLoading || selectedContentTypes.length === 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      {selectedContentTypes.length > 1
                        ? `Transform to ${selectedContentTypes.length} Formats`
                        : 'Transform Content'}
                    </>
                  )}
                </Button>
                
                {selectedContentTypes.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 rounded-lg bg-black/30 border border-white/10"
                  >
                    <p className="text-sm text-white/60 mb-2">Selected formats:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedContentTypes.map(typeId => {
                        const selectedType = contentTypes.find(type => type.id === typeId);
                        const SelectedIcon = selectedType?.icon;
                        
                        return (
                          <CustomBadge 
                            key={typeId}
                            animated
                            className={`bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border-white/10 text-white cursor-pointer ${activeContentType === typeId ? 'ring-1 ring-neon-purple' : ''}`}
                            icon={SelectedIcon && React.createElement(SelectedIcon, { className: "h-3 w-3" })}
                            onClick={() => {
                              if (repurposedContent[typeId]) {
                                setActiveContentType(typeId);
                              }
                            }}
                          >
                            {selectedType?.name}
                          </CustomBadge>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
              
              <motion.div variants={itemVariants} className="w-full md:w-2/3">
                {isLoading ? (
                  <div className="border border-dashed border-white/10 rounded-lg p-10 h-full flex items-center justify-center backdrop-blur-sm bg-black/20">
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-neon-purple animate-pulse-glow" />
                      <p className="text-white/60">Transforming your content...</p>
                      <p className="text-white/40 text-sm mt-2">
                        Generating {selectedContentTypes.length} format{selectedContentTypes.length !== 1 ? 's' : ''}
                      </p>
                    </motion.div>
                  </div>
                ) : Object.keys(repurposedContent).length > 0 && activeContentType ? (
                  <div className="rounded-lg border border-white/10 overflow-hidden">
                    <div className="bg-black/40 backdrop-blur-sm p-3 border-b border-white/10 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-neon-purple mr-2"></div>
                        <h3 className="text-sm font-medium text-white">
                          {contentTypes.find(t => t.id === activeContentType)?.name}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => copyToClipboard(repurposedContent[activeContentType])}
                          className="text-xs h-8 hover:bg-white/10"
                        >
                          <Copy className="h-3 w-3 mr-1" /> Copy
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => saveAsDraft(activeContentType)}
                          className="text-xs h-8 hover:bg-white/10"
                        >
                          <Save className="h-3 w-3 mr-1" /> Save Draft
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs h-8 hover:bg-white/10">
                          <Download className="h-3 w-3 mr-1" /> Export
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 bg-black/20 backdrop-blur-sm">
                      <div className="whitespace-pre-wrap text-sm mt-2 font-mono text-white/80 p-3 rounded bg-black/20 border border-white/5 shadow-inner">
                        {repurposedContent[activeContentType]}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-white/10 rounded-lg p-10 h-full flex items-center justify-center backdrop-blur-sm bg-black/20">
                    <motion.div 
                      className="text-center max-w-md"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="h-16 w-16 rounded-full bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-white/40" />
                      </div>
                      <p className="text-white/60 mb-2">
                        {selectedContentTypes.length > 0 
                          ? "Select content types and click 'Transform'" 
                          : "Select content types to get started"}
                      </p>
                      <p className="text-white/40 text-sm">
                        {selectedContentTypes.length > 0 
                          ? `Choose from ${selectedContentTypes.length} format${selectedContentTypes.length !== 1 ? 's' : ''} to transform your content` 
                          : "Choose from various content formats to repurpose your existing content"}
                      </p>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
