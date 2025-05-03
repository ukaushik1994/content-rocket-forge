
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { ContentBuilder } from '@/components/content-builder/ContentBuilder';
import { ContentBuilderProvider } from '@/contexts/ContentBuilderContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentRepository } from '@/components/content/ContentRepository';
import { PenSquare, FolderOpen } from 'lucide-react';

// Main ContentPage component
const ContentPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('create');
  
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Content Creator | SEO Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Content Manager</h1>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="create" className="gap-1.5">
                  <PenSquare className="h-4 w-4" />
                  Create Content
                </TabsTrigger>
                <TabsTrigger value="repository" className="gap-1.5">
                  <FolderOpen className="h-4 w-4" />
                  Content Repository
                </TabsTrigger>
              </TabsList>
              
              <div className="space-x-2">
                {activeTab === 'create' && (
                  <>
                    <Button variant="outline">Save Draft</Button>
                    <Button>Publish</Button>
                  </>
                )}
              </div>
            </div>
            
            <TabsContent value="create" className="pt-2">
              {/* Wrap everything in ContentBuilderProvider */}
              <ContentBuilderProvider>
                <ContentBuilder />
              </ContentBuilderProvider>
            </TabsContent>
            
            <TabsContent value="repository" className="pt-2">
              <ContentRepository />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ContentPage;
