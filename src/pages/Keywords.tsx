
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { KeywordsList } from '@/components/keywords/KeywordsList';
import { KeywordResearchTool } from '@/components/keywords/KeywordResearchTool';
import { KeywordCluster } from '@/components/keywords/KeywordCluster';
import { KeywordCompetitors } from '@/components/keywords/KeywordCompetitors';
import { KeywordTrends } from '@/components/keywords/KeywordTrends';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { Helmet } from 'react-helmet';

const Keywords = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Keywords Research | SEO Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Keywords</h1>
            <p className="text-muted-foreground">
              Research, organize, and analyze your keywords
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/content-builder" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Create Content
              </Link>
            </Button>
            
            <Button size="sm" className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple">
              <Plus className="h-4 w-4 mr-1" /> Add Keywords
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="research" className="space-y-4">
          <TabsList className="w-full border-b pb-0 bg-transparent">
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="list">My Keywords</TabsTrigger>
            <TabsTrigger value="clusters">Clusters</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="research" className="space-y-4">
            <KeywordResearchTool />
          </TabsContent>
          
          <TabsContent value="list" className="space-y-4">
            <KeywordsList />
          </TabsContent>
          
          <TabsContent value="clusters" className="space-y-4">
            <KeywordCluster />
          </TabsContent>
          
          <TabsContent value="competitors" className="space-y-4">
            <KeywordCompetitors />
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-4">
            <KeywordTrends />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Keywords;
