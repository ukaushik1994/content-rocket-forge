
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SerpKeywordsTab } from './serp-tabs/SerpKeywordsTab';
import { SerpQuestionsTab } from './serp-tabs/SerpQuestionsTab';
import { SerpEntitiesTab } from './serp-tabs/SerpEntitiesTab';
import { SerpHeadingsTab } from './serp-tabs/SerpHeadingsTab';
import { SerpAnalysisResult } from '@/types/serp';
import { SerpContentGapsTab } from './serp-tabs/SerpContentGapsTab';
import { SerpCompetitorsTab } from './serp-tabs/SerpCompetitorsTab';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SerpAnalysisPanelProps {
  serpData: SerpAnalysisResult | null;
  isLoading: boolean;
  mainKeyword: string;
  onAddToContent?: (content: string, type: string) => void;
  onRetry?: () => void;
}

export function SerpAnalysisPanel({ 
  serpData, 
  isLoading, 
  mainKeyword,
  onAddToContent = () => {},
  onRetry = () => {}
}: SerpAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState('keywords');

  if (isLoading) {
    return <SerpLoadingState />;
  }

  if (!serpData) {
    return <SerpNoApiKeyState onRetry={onRetry} />;
  }

  if (Object.keys(serpData).length === 0) {
    return <SerpNoDataState keyword={mainKeyword} onRetry={onRetry} />;
  }

  return (
    <div className="border rounded-lg shadow-lg overflow-hidden">
      <Tabs defaultValue="keywords" value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-card border-b px-4 py-2">
          <TabsList className="grid grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="headings">Headings</TabsTrigger>
            <TabsTrigger value="contentGaps">Gaps</TabsTrigger>
            <TabsTrigger value="competitors">Competition</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="p-4 bg-background">
          <TabsContent value="keywords">
            <SerpKeywordsTab serpData={serpData} onAddToContent={onAddToContent} />
          </TabsContent>
          
          <TabsContent value="questions">
            <SerpQuestionsTab serpData={serpData} onAddToContent={onAddToContent} />
          </TabsContent>
          
          <TabsContent value="entities">
            <SerpEntitiesTab serpData={serpData} onAddToContent={onAddToContent} />
          </TabsContent>
          
          <TabsContent value="headings">
            <SerpHeadingsTab serpData={serpData} onAddToContent={onAddToContent} />
          </TabsContent>
          
          <TabsContent value="contentGaps">
            <SerpContentGapsTab serpData={serpData} onAddToContent={onAddToContent} />
          </TabsContent>
          
          <TabsContent value="competitors">
            <SerpCompetitorsTab serpData={serpData} onAddToContent={onAddToContent} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// Loading state component
function SerpLoadingState() {
  return (
    <div className="border rounded-lg shadow-lg p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-[250px]" />
        <Skeleton className="h-4 w-[400px]" />
      </div>
      
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );
}

// No API Key state component
function SerpNoApiKeyState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="border rounded-lg shadow-lg p-6">
      <div className="text-center py-8 space-y-4">
        <div className="bg-amber-500/10 text-amber-500 p-4 rounded-full inline-flex">
          <Settings size={28} />
        </div>
        <h3 className="text-xl font-semibold">SERP API Key Required</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          A SERP API key is needed to analyze keywords and get search data. Please add your API key in Settings.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="outline" onClick={onRetry}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild>
            <Link to="/settings/api">
              <Settings className="mr-2 h-4 w-4" />
              API Settings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// No Data found state component
function SerpNoDataState({ keyword, onRetry }: { keyword: string, onRetry: () => void }) {
  return (
    <div className="border rounded-lg shadow-lg p-6">
      <div className="text-center py-8 space-y-4">
        <div className="bg-red-500/10 text-red-500 p-4 rounded-full inline-flex">
          <AlertCircle size={28} />
        </div>
        <h3 className="text-xl font-semibold">No Search Data Found</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          We couldn't find any SERP data for "{keyword}". Please try another keyword or ensure your API key is valid.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button onClick={onRetry}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
