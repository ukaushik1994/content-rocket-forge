
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
    <div className="min-h-screen flex flex-col bg-gradient-radial from-background via-background to-background/90">
      <Helmet>
        <title>Content Creator | SEO Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container mx-auto py-12 px-6 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-neon-blue rounded-full animate-pulse-glow"></div>
          <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-neon-purple rounded-full animate-pulse-glow"></div>
          <div className="hidden md:block absolute top-1/4 right-1/3 w-2 h-2 bg-neon-pink rounded-full animate-pulse-glow"></div>
        </div>
        
        <div className="flex flex-col space-y-8 relative z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">Content Manager</h1>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center">
              <TabsList className="glass-panel shadow-lg border border-white/10">
                <TabsTrigger value="create" className="gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-md">
                  <PenSquare className="h-4 w-4" />
                  Create Content
                </TabsTrigger>
                <TabsTrigger value="repository" className="gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-md">
                  <FolderOpen className="h-4 w-4" />
                  Content Repository
                </TabsTrigger>
              </TabsList>
              
              <div className="space-x-3">
                {activeTab === 'create' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="glass-panel border border-white/10 hover:border-primary/50 transition-all"
                    >
                      Save Draft
                    </Button>
                    <Button className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all shadow-lg hover:shadow-primary/20">
                      Publish
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <TabsContent value="create" className="pt-6">
              <div className="glass-panel border border-white/10 rounded-xl p-6 shadow-lg backdrop-blur-xl">
                {/* Wrap everything in ContentBuilderProvider */}
                <ContentBuilderProvider>
                  <ContentBuilder />
                </ContentBuilderProvider>
              </div>
            </TabsContent>
            
            <TabsContent value="repository" className="pt-6">
              <div className="glass-panel border border-white/10 rounded-xl p-6 shadow-lg backdrop-blur-xl">
                <ContentRepository />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ContentPage;
