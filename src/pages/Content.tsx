
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import { ContentRepository } from '@/components/content/ContentRepository';
import { ContentApprovalView } from '@/components/approval/ContentApprovalView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ContentPage = () => {
  const [activeTab, setActiveTab] = React.useState('repository');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Content Management | SEO Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Content Management</h1>
          
          <Tabs defaultValue="repository" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="repository">Content Repository</TabsTrigger>
              <TabsTrigger value="approval">Approval Queue</TabsTrigger>
            </TabsList>
            
            <TabsContent value="repository" className="mt-6">
              <ContentRepository />
            </TabsContent>
            
            <TabsContent value="approval" className="mt-6">
              <ContentApprovalView />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ContentPage;
