
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface SerpApiTesterProps {
  onTestComplete?: (data: any) => void;
}

export function SerpApiTester({ onTestComplete = () => {} }: SerpApiTesterProps) {
  const [testKeyword, setTestKeyword] = useState('test');
  const [isLoading, setIsLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [showRawData, setShowRawData] = useState(false);
  const [activeTab, setActiveTab] = useState('test');

  const runSerpTest = async () => {
    if (!testKeyword.trim()) {
      toast.error('Please enter a test keyword');
      return;
    }

    setIsLoading(true);
    setRawResponse(null);
    setExtractedData(null);
    setTestResults(null);

    try {
      console.log('🧪 Running SERP API test for keyword:', testKeyword);
      
      // Call the SERP API directly
      const response = await fetch('/api/serp-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: 'analyze',
          params: { keyword: testKeyword },
          apiKey: await getStoredApiKey()
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ SERP API test successful:', data);
      
      setRawResponse(data);
      setExtractedData(data);
      
      // Analyze the test results
      const analysis = analyzeSerpData(data);
      setTestResults(analysis);
      
      onTestComplete(data);
      toast.success('SERP API test completed successfully');
      
    } catch (error) {
      console.error('❌ SERP API test failed:', error);
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeSerpData = (data: any) => {
    const analysis = {
      dataPresence: {
        organicResults: !!data.topResults && data.topResults.length > 0,
        peopleAlsoAsk: !!data.peopleAlsoAsk && data.peopleAlsoAsk.length > 0,
        featuredSnippets: !!data.featuredSnippets && data.featuredSnippets.length > 0,
        relatedSearches: !!data.relatedSearches && data.relatedSearches.length > 0,
        entities: !!data.entities && data.entities.length > 0,
        headings: !!data.headings && data.headings.length > 0,
        contentGaps: !!data.contentGaps && data.contentGaps.length > 0,
        knowledgeGraph: !!data.knowledgeGraph,
        localResults: !!data.localResults && data.localResults.length > 0,
        multimediaOpportunities: !!data.multimediaOpportunities && data.multimediaOpportunities.length > 0,
        commercialSignals: !!data.commercialSignals
      },
      counts: {
        organicResults: data.topResults?.length || 0,
        peopleAlsoAsk: data.peopleAlsoAsk?.length || 0,
        featuredSnippets: data.featuredSnippets?.length || 0,
        relatedSearches: data.relatedSearches?.length || 0,
        entities: data.entities?.length || 0,
        headings: data.headings?.length || 0,
        contentGaps: data.contentGaps?.length || 0,
        localResults: data.localResults?.length || 0,
        multimediaOpportunities: data.multimediaOpportunities?.length || 0
      },
      quality: {
        hasMinimumData: (data.topResults?.length || 0) >= 3,
        hasQuestions: (data.peopleAlsoAsk?.length || 0) > 0,
        hasSnippets: (data.featuredSnippets?.length || 0) > 0,
        hasEntities: (data.entities?.length || 0) > 0
      },
      isMockData: data.isMockData || false
    };

    // Calculate overall score
    const totalFields = Object.keys(analysis.dataPresence).length;
    const presentFields = Object.values(analysis.dataPresence).filter(Boolean).length;
    analysis.overallScore = Math.round((presentFields / totalFields) * 100);

    return analysis;
  };

  const getStoredApiKey = async () => {
    // Try to get API key from settings or storage
    const storedKey = localStorage.getItem('serp_api_key');
    if (storedKey) return storedKey;
    
    // If no key found, this will trigger mock data
    return null;
  };

  const copyToClipboard = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success('Data copied to clipboard');
  };

  const downloadData = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${testKeyword}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          SERP API Live Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Controls */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter test keyword..."
            value={testKeyword}
            onChange={(e) => setTestKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && runSerpTest()}
            className="flex-1"
          />
          <Button 
            onClick={runSerpTest} 
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {isLoading ? 'Testing...' : 'Test'}
          </Button>
        </div>

        {/* Results Tabs */}
        {(testResults || rawResponse) && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="test">Test Results</TabsTrigger>
              <TabsTrigger value="analysis">Data Analysis</TabsTrigger>
              <TabsTrigger value="raw">Raw Data</TabsTrigger>
            </TabsList>

            <TabsContent value="test" className="space-y-4">
              {testResults && (
                <div className="space-y-4">
                  {/* Overall Score */}
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <h3 className="font-semibold">Overall Data Quality</h3>
                      <p className="text-sm text-muted-foreground">
                        {testResults.isMockData ? 'Using mock data' : 'Using real SERP data'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{testResults.overallScore}%</div>
                      <Badge variant={testResults.overallScore >= 70 ? 'default' : 'secondary'}>
                        {testResults.overallScore >= 70 ? 'Good' : 'Limited'}
                      </Badge>
                    </div>
                  </div>

                  {/* Data Presence Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(testResults.dataPresence).map(([key, present]) => (
                      <div key={key} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        {present ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {testResults.counts[key] || 0}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Quality Indicators */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Quality Indicators</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(testResults.quality).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          {value ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          )}
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              {extractedData && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Extracted Data Structure</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(extractedData)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadData(extractedData, 'extracted-data')}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  <ScrollArea className="h-[400px] w-full border rounded-md p-4">
                    <pre className="text-xs">
                      {JSON.stringify(extractedData, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>

            <TabsContent value="raw" className="space-y-4">
              {rawResponse && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Raw API Response</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRawData(!showRawData)}
                      >
                        {showRawData ? (
                          <EyeOff className="h-3 w-3 mr-1" />
                        ) : (
                          <Eye className="h-3 w-3 mr-1" />
                        )}
                        {showRawData ? 'Hide' : 'Show'} Raw
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(rawResponse)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadData(rawResponse, 'raw-response')}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  {showRawData && (
                    <ScrollArea className="h-[400px] w-full border rounded-md p-4">
                      <pre className="text-xs">
                        {JSON.stringify(rawResponse, null, 2)}
                      </pre>
                    </ScrollArea>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
