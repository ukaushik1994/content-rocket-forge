
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentTemplatesProvider } from '@/contexts/ContentTemplatesContext';
import { TemplateLibrary } from '@/components/templates/TemplateLibrary';
import { TemplateBuilder } from '@/components/templates/TemplateBuilder';
import { FileTemplate, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ContentTemplatesPage = () => {
  return (
    <>
      <Helmet>
        <title>Content Templates Hub - AI Content Assistant</title>
        <meta name="description" content="Browse, customize, and create content templates for blogs, landing pages, social media, and more with AI-powered generation." />
      </Helmet>
      
      <ContentTemplatesProvider>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                  <FileTemplate className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Content Templates Hub
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Access a library of proven templates or create your own custom templates with AI-powered content generation.
              </p>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="library" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="library" className="flex items-center gap-2">
                  <FileTemplate className="h-4 w-4" />
                  Template Library
                </TabsTrigger>
                <TabsTrigger value="builder" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Template Builder
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="library">
                <TemplateLibrary />
              </TabsContent>
              
              <TabsContent value="builder">
                <TemplateBuilder />
              </TabsContent>
            </Tabs>

            {/* Features Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-lg bg-card border">
                <FileTemplate className="h-8 w-8 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">Ready-to-Use Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Choose from professionally designed templates for various content types.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-card border">
                <Sparkles className="h-8 w-8 mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-semibold mb-2">AI-Powered Generation</h3>
                <p className="text-sm text-muted-foreground">
                  Generate high-quality content using AI with your custom variables and structure.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-card border">
                <FileTemplate className="h-8 w-8 mx-auto mb-4 text-purple-500" />
                <h3 className="text-lg font-semibold mb-2">Custom Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Create and save your own templates for consistent brand messaging and style.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ContentTemplatesProvider>
    </>
  );
};

export default ContentTemplatesPage;
