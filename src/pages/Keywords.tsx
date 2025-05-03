
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { Container } from '@/components/ui/Container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { KeywordResearchTool } from '@/components/keywords/KeywordResearchTool';
import { KeywordsList } from '@/components/keywords/KeywordsList';
import { KeywordCluster } from '@/components/keywords/KeywordCluster';
import { KeywordTrends } from '@/components/keywords/KeywordTrends';
import { KeywordCompetitors } from '@/components/keywords/KeywordCompetitors';
import { Helmet } from 'react-helmet-async';

// Define the KeywordProps interface to pass to KeywordsList
interface KeywordProps {
  id: string;
  primary: string;
  volume: number;
  difficulty: number;
  cpc: number;
  intent: string;
  trend: string;
  serp: string;
  selected: boolean;
}

// Sample data for demonstration
const sampleKeywords: KeywordProps[] = [
  {
    id: '1',
    primary: 'content marketing',
    volume: 12000,
    difficulty: 68,
    cpc: 2.45,
    intent: 'informational',
    trend: 'increasing',
    serp: 'featured_snippet',
    selected: false
  },
  {
    id: '2',
    primary: 'seo optimization',
    volume: 9500,
    difficulty: 72,
    cpc: 3.15,
    intent: 'commercial',
    trend: 'stable',
    serp: 'local_pack',
    selected: true
  }
];

const KeywordsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Keywords | SEO Platform</title>
      </Helmet>
      
      <Navbar />
      
      <Container className="flex-1 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Keywords Research</h1>
          
          <div className="space-x-2">
            <Button variant="outline">Import</Button>
            <Button>Add Keywords</Button>
          </div>
        </div>
        
        <Tabs defaultValue="research">
          <TabsList className="mb-6">
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="my-keywords">My Keywords</TabsTrigger>
            <TabsTrigger value="clusters">Clusters</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="research">
            <KeywordResearchTool />
          </TabsContent>
          
          <TabsContent value="my-keywords">
            <KeywordsList keywords={sampleKeywords} />
          </TabsContent>
          
          <TabsContent value="clusters">
            <KeywordCluster />
          </TabsContent>
          
          <TabsContent value="trends">
            <KeywordTrends />
          </TabsContent>
          
          <TabsContent value="competitors">
            <KeywordCompetitors />
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  );
};

export default KeywordsPage;
