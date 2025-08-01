
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Sparkles } from 'lucide-react';
import { TemplateLibrary } from '@/components/templates/TemplateLibrary';
import { TemplateBuilder } from '@/components/templates/TemplateBuilder';
import { ContentTemplatesProvider } from '@/contexts/ContentTemplatesContext';
import { motion } from 'framer-motion';

const ContentTemplatesPage = () => {
  return (
    <ContentTemplatesProvider>
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <Helmet>
          <title>Content Templates - SEO Content Tool</title>
          <meta name="description" content="Browse and create content templates for faster content creation" />
        </Helmet>
        
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <FileText className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Content Templates</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Accelerate your content creation with AI-powered templates. Choose from our library or create your own.
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Template Library
                </CardTitle>
                <CardDescription>
                  Browse our collection of proven content templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Browse Templates
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Template
                </CardTitle>
                <CardDescription>
                  Build your own custom content template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create New Template
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TemplateLibrary />
            </div>
            <div>
              <TemplateBuilder />
            </div>
          </div>
        </div>
      </div>
    </ContentTemplatesProvider>
  );
};

export default ContentTemplatesPage;
