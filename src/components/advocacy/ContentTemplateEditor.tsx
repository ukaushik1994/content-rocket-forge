
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Edit3, 
  Copy, 
  Share2, 
  Wand2, 
  Eye, 
  Calendar,
  Hash,
  AtSign,
  Link,
  Sparkles,
  Target,
  Users,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface TemplateVariable {
  key: string;
  label: string;
  placeholder: string;
  value: string;
  type: 'text' | 'select' | 'number';
  options?: string[];
}

interface ContentTemplate {
  id: number;
  title: string;
  category: string;
  template: string;
  variables: TemplateVariable[];
  platforms: string[];
  points: number;
  tone: 'professional' | 'casual' | 'enthusiastic' | 'informative';
  hashtags: string[];
  mentions: string[];
}

interface ContentTemplateEditorProps {
  template: ContentTemplate;
  onSave: (content: string) => void;
  onShare: (platform: string, content: string) => void;
}

export const ContentTemplateEditor: React.FC<ContentTemplateEditorProps> = ({
  template,
  onSave,
  onShare
}) => {
  const [variables, setVariables] = useState<TemplateVariable[]>(template.variables);
  const [customContent, setCustomContent] = useState(template.template);
  const [selectedTone, setSelectedTone] = useState(template.tone);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeMentions, setIncludeMentions] = useState(false);
  const [contentLength, setContentLength] = useState([100]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  // Generate preview content when variables change
  useEffect(() => {
    let preview = customContent;
    
    // Replace variables
    variables.forEach(variable => {
      const placeholder = `{${variable.key}}`;
      preview = preview.replace(new RegExp(placeholder, 'g'), variable.value || variable.placeholder);
    });

    // Add hashtags if enabled
    if (includeHashtags && template.hashtags.length > 0) {
      const hashtags = template.hashtags.map(tag => `#${tag}`).join(' ');
      preview += `\n\n${hashtags}`;
    }

    // Add mentions if enabled
    if (includeMentions && template.mentions.length > 0) {
      const mentions = template.mentions.map(mention => `@${mention}`).join(' ');
      preview += `\n\n${mentions}`;
    }

    setPreviewContent(preview);
  }, [variables, customContent, includeHashtags, includeMentions, template]);

  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => prev.map(variable => 
      variable.key === key ? { ...variable, value } : variable
    ));
  };

  const generateAISuggestions = async () => {
    setIsGeneratingAI(true);
    // Simulate AI generation
    setTimeout(() => {
      const suggestions = [
        "Consider mentioning the impact on team productivity",
        "Add a call-to-action for engagement",
        "Include relevant industry statistics",
        "Mention company values or mission"
      ];
      setAiSuggestions(suggestions);
      setIsGeneratingAI(false);
      toast.success("AI suggestions generated!");
    }, 2000);
  };

  const optimizeForPlatform = (platform: string) => {
    let optimized = previewContent;
    
    switch (platform) {
      case 'LinkedIn':
        // LinkedIn optimization
        if (optimized.length > 3000) {
          optimized = optimized.substring(0, 2950) + '...';
        }
        break;
      case 'Twitter':
        // Twitter optimization
        if (optimized.length > 280) {
          optimized = optimized.substring(0, 250) + '...';
        }
        break;
      case 'Facebook':
        // Facebook optimization - longer form is ok
        break;
    }
    
    return optimized;
  };

  const handleShare = (platform: string) => {
    const optimizedContent = optimizeForPlatform(platform);
    onShare(platform, optimizedContent);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(previewContent);
    toast.success("Content copied to clipboard!");
  };

  const characterCount = previewContent.length;
  const getCharacterCountColor = (platform: string) => {
    const limits = { Twitter: 280, LinkedIn: 3000, Facebook: 8000 };
    const limit = limits[platform as keyof typeof limits] || 3000;
    const ratio = characterCount / limit;
    
    if (ratio > 0.9) return "text-red-500";
    if (ratio > 0.7) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Customize Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="customize" className="space-y-4">
            <TabsList className="bg-white/10">
              <TabsTrigger value="customize">Customize</TabsTrigger>
              <TabsTrigger value="optimize">Optimize</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="customize" className="space-y-4">
              {/* Template Variables */}
              <div className="space-y-3">
                <Label className="text-white">Template Variables</Label>
                {variables.map((variable) => (
                  <div key={variable.key} className="space-y-2">
                    <Label className="text-white/70 text-sm">{variable.label}</Label>
                    {variable.type === 'select' ? (
                      <Select 
                        value={variable.value} 
                        onValueChange={(value) => handleVariableChange(variable.key, value)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/20">
                          <SelectValue placeholder={variable.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {variable.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={variable.value}
                        onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                        placeholder={variable.placeholder}
                        className="bg-white/5 border-white/20 text-white"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Custom Content */}
              <div className="space-y-2">
                <Label className="text-white">Custom Message</Label>
                <Textarea
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  className="bg-white/5 border-white/20 text-white min-h-[120px]"
                  placeholder="Customize your message..."
                />
              </div>
            </TabsContent>

            <TabsContent value="optimize" className="space-y-4">
              {/* Tone Selection */}
              <div className="space-y-2">
                <Label className="text-white">Tone</Label>
                <Select value={selectedTone} onValueChange={(value: any) => setSelectedTone(value)}>
                  <SelectTrigger className="bg-white/5 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    <SelectItem value="informative">Informative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Content Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Include Hashtags</Label>
                  <Switch 
                    checked={includeHashtags} 
                    onCheckedChange={setIncludeHashtags}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-white">Include Mentions</Label>
                  <Switch 
                    checked={includeMentions} 
                    onCheckedChange={setIncludeMentions}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Target Length: {contentLength[0]}%</Label>
                  <Slider
                    value={contentLength}
                    onValueChange={setContentLength}
                    max={150}
                    min={50}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">AI Suggestions</Label>
                  <Button
                    size="sm"
                    onClick={generateAISuggestions}
                    disabled={isGeneratingAI}
                    className="bg-gradient-to-r from-neon-purple to-neon-blue"
                  >
                    <Wand2 className="h-4 w-4 mr-1" />
                    {isGeneratingAI ? 'Generating...' : 'Get Suggestions'}
                  </Button>
                </div>
                
                <AnimatePresence>
                  {aiSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      {aiSuggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3"
                        >
                          <div className="flex items-start gap-2">
                            <Sparkles className="h-4 w-4 text-blue-400 mt-0.5" />
                            <p className="text-sm text-white/80">{suggestion}</p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {/* Platform Previews */}
              <div className="space-y-4">
                {template.platforms.map((platform) => (
                  <Card key={platform} className="bg-white/5 border-white/10">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{platform}</Badge>
                          <span className={`text-xs ${getCharacterCountColor(platform)}`}>
                            {optimizeForPlatform(platform).length} characters
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleShare(platform)}
                          className="bg-gradient-to-r from-neon-purple to-neon-blue"
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-white/90 text-sm whitespace-pre-wrap">
                          {optimizeForPlatform(platform)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button
                  onClick={() => onSave(previewContent)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Save & Schedule
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
