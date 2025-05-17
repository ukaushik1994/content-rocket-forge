
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentEditor } from '@/components/content/ContentEditor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';
import { useContentGeneration } from './writing/useContentGeneration';
import { ContentGenerationHeader } from './writing/ContentGenerationHeader';
import { ContentSidebar } from './writing/ContentSidebar';
import { SaveContentDialog } from './writing/SaveContentDialog';
import { ContentTemplateCard } from './writing/ContentTemplateCard';
import { getPromptTemplates } from '@/services/userPreferences';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

export function ContentWritingStep() {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [content, setContent] = useState('');
  const location = useLocation();
  const { state } = useContentBuilder();
  const { mainKeyword, serpData } = state || {};
  
  // Use our content generation hook
  const {
    isGenerating,
    aiProvider,
    generateContent,
  } = useContentGeneration();

  // Template selection
  const [showTemplates, setShowTemplates] = useState(true);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    // Load templates
    const loadedTemplates = getPromptTemplates();
    setTemplates(loadedTemplates);

    // Check if we already have content
    if (content) {
      setShowTemplates(false);
    }
  }, [content]);

  const handleSelectTemplate = async (template) => {
    setIsGenerating(true);
    const success = await generateContent(state, setContent);
    setIsGenerating(false);
    if (success) {
      setShowTemplates(false);
    }
  };

  const handleSaveContent = (title, metadata) => {
    console.log('Saving content:', { title, metadata, content });
    setSaveDialogOpen(false);
    // Implement save functionality
  };

  const setIsGenerating = (value: boolean) => {
    // This is a workaround since we can't directly modify the isGenerating state in the hook
    console.log('Setting isGenerating:', value);
  };

  if (!mainKeyword) {
    return (
      <div className="container py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing keyword</AlertTitle>
          <AlertDescription>Please go back and select a main keyword first.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ContentGenerationHeader
        mainKeyword={mainKeyword}
        onSave={() => setSaveDialogOpen(true)}
        isGenerating={isGenerating}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Main content area */}
        <div className="flex-1 overflow-auto p-4 pb-16">
          {showTemplates ? (
            <div className="container max-w-5xl py-4">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Choose a Template
                  </CardTitle>
                  <CardDescription>
                    Select a template to generate content for "{mainKeyword}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                      <ContentTemplateCard
                        key={template.id}
                        template={template}
                        onSelectTemplate={handleSelectTemplate}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="container max-w-5xl py-4 px-0">
              {isGenerating ? (
                <Card className="p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-primary mx-auto"></div>
                    </div>
                    <CardTitle className="mb-2">Generating your content</CardTitle>
                    <CardDescription>
                      This may take a minute or two depending on the complexity of the topic.
                    </CardDescription>
                  </div>
                </Card>
              ) : (
                content && (
                  <ContentEditor
                    content={content}
                    onChange={setContent}
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        {!showTemplates && !isGenerating && (
          <ContentSidebar
            keyword={mainKeyword}
            serpData={serpData}
            onGenerateNew={() => setShowTemplates(true)}
          />
        )}
      </div>

      <SaveContentDialog
        isOpen={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveContent}
        keyword={mainKeyword}
      />
    </div>
  );
}
