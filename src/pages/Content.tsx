
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentRepository } from '@/components/content/ContentRepository';
import { ContentEditor } from '@/components/content/ContentEditor';
import { SerpKeywordSuggestions } from '@/components/content/SerpKeywordSuggestions';
import { SerpAnalysisPanel } from '@/components/content/SerpAnalysisPanel';
import { Helmet } from 'react-helmet-async';

const ContentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("editor");
  const [content, setContent] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [serpData, setSerpData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mainKeyword, setMainKeyword] = useState("");

  const handleKeywordSelect = (keyword: string) => {
    if (!selectedKeywords.includes(keyword)) {
      setSelectedKeywords([...selectedKeywords, keyword]);
      setMainKeyword(keyword);
    }
  };

  const handleKeywordsSelect = (keywords: string[]) => {
    const newKeywords = keywords.filter(k => !selectedKeywords.includes(k));
    if (newKeywords.length > 0) {
      setSelectedKeywords([...selectedKeywords, ...newKeywords]);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };
  
  // Function to handle adding content from SERP analysis
  const handleAddToContent = (contentToAdd: string, type: string) => {
    setContent(prev => prev + contentToAdd);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Content Creator | SEO Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Content Creator</h1>
            <div className="space-x-2">
              <Button variant="outline">Save Draft</Button>
              <Button>Publish</Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="repository">Content Repository</TabsTrigger>
                </TabsList>
                <TabsContent value="editor" className="mt-4">
                  <ContentEditor 
                    content={content}
                    onContentChange={handleContentChange}
                  />
                </TabsContent>
                <TabsContent value="repository">
                  <ContentRepository />
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-6">
              <SerpKeywordSuggestions 
                onKeywordSelect={handleKeywordSelect}
                onRelatedKeywordsSelect={handleKeywordsSelect}
              />
              
              <SerpAnalysisPanel 
                serpData={serpData}
                isLoading={isAnalyzing}
                mainKeyword={mainKeyword}
                onAddToContent={handleAddToContent}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContentPage;
