
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { ContentEditor } from '@/components/content/ContentEditor';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  PlusCircle,
  Save,
  Share2,
  FileText,
  Loader2,
} from 'lucide-react';

const Content = () => {
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    const promise = new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
    
    toast.promise(promise, {
      loading: 'Generating optimized content...',
      success: 'Content generated successfully!',
      error: 'Failed to generate content',
    });
    
    // Use the promise to set loading state after it resolves
    promise.then(() => {
      setLoading(false);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gradient">Content Builder</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-1 neon-border">
                <Save className="h-4 w-4" />
                <span>Save</span>
              </Button>
              <Button variant="outline" className="gap-1 neon-border">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
              <Button 
                className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple gap-1"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="h-4 w-4" />
                )}
                <span>Generate</span>
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="editor">
            <TabsList className="bg-secondary/30">
              <TabsTrigger value="editor" className="gap-2">
                <FileText className="h-4 w-4" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="published" className="gap-2">
                <FileText className="h-4 w-4" />
                Published
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="mt-4">
              <ContentEditor />
            </TabsContent>
            
            <TabsContent value="published" className="mt-4">
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-16 h-16 rounded-full bg-glass flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-medium">No Published Content Yet</h2>
                <p className="text-muted-foreground text-center max-w-md">
                  After you generate and publish content, it will appear here with performance metrics and optimization suggestions.
                </p>
                <Button className="mt-2">Create Your First Content</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Content;
