import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlossaryBuilderHeader } from '@/components/glossary-builder/GlossaryBuilderHeader';
import { DomainAnalysisMode } from '@/components/glossary-builder/term-input/DomainAnalysisMode';
import { TopicSuggestionMode } from '@/components/glossary-builder/term-input/TopicSuggestionMode';
import { ManualBulkMode } from '@/components/glossary-builder/term-input/ManualBulkMode';
import { TermsList } from '@/components/glossary-builder/term-management/TermsList';
import { GlossaryBuilderProvider } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { Helmet } from 'react-helmet-async';

export default function GlossaryBuilder() {
  const [activeTab, setActiveTab] = useState("domain");

  return (
    <GlossaryBuilderProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Helmet>
          <title>Glossary Builder | Content Rocket Forge</title>
        </Helmet>
        
        <Navbar />
        
        <div className="flex-1 container mx-auto px-4 py-6 space-y-6">
          <GlossaryBuilderHeader />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="domain">Domain Analysis</TabsTrigger>
                  <TabsTrigger value="topic">Topic Mode</TabsTrigger>
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                </TabsList>

                <TabsContent value="domain" className="space-y-4">
                  <DomainAnalysisMode />
                </TabsContent>

                <TabsContent value="topic" className="space-y-4">
                  <TopicSuggestionMode />
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                  <ManualBulkMode />
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Terms Management */}
            <div className="lg:col-span-1">
              <TermsList />
            </div>
          </div>
        </div>
      </div>
    </GlossaryBuilderProvider>
  );
}