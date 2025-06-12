
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { TemplateLibrary } from './TemplateLibrary';
import { ContentTemplateEditor } from './ContentTemplateEditor';

interface Template {
  id: number;
  title: string;
  category: string;
  template: string;
  variables: Array<{
    key: string;
    label: string;
    placeholder: string;
    value: string;
    type: 'text' | 'select' | 'number';
    options?: string[];
  }>;
  platforms: string[];
  points: number;
  tone: 'professional' | 'casual' | 'enthusiastic' | 'informative';
  hashtags: string[];
  mentions: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  popularity: number;
  trending: boolean;
  featured: boolean;
}

export const ContentTemplates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [view, setView] = useState<'library' | 'editor'>('library');

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setView('editor');
  };

  const handleBack = () => {
    setView('library');
    setSelectedTemplate(null);
  };

  const handleSave = (content: string) => {
    toast.success(`Content saved and scheduled! +${selectedTemplate?.points} points earned 🎉`);
  };

  const handleShare = (platform: string, content: string) => {
    toast.success(`Shared to ${platform}! +${selectedTemplate?.points} points earned 🎉`);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {view === 'library' ? (
          <motion.div
            key="library"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TemplateLibrary onSelectTemplate={handleTemplateSelect} />
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Header */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Library
                  </Button>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-neon-purple" />
                    <CardTitle className="text-white">{selectedTemplate?.title}</CardTitle>
                    <Badge variant="outline">{selectedTemplate?.category}</Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Editor */}
            {selectedTemplate && (
              <ContentTemplateEditor
                template={selectedTemplate}
                onSave={handleSave}
                onShare={handleShare}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
