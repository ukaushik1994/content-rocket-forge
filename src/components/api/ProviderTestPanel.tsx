
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Loader2, Play, Code, RefreshCw } from 'lucide-react';
import { ApiProviderConfig } from '@/components/settings/api/types';

export interface TestResponse {
  success: boolean;
  data?: any;
  error?: string;
  responseTime?: number;
  timestamp: Date;
}

export interface ProviderTestPanelProps {
  provider: ApiProviderConfig;
  apiKey: string;
  onTest: (apiKey: string, options?: any) => Promise<TestResponse>;
  isTesting: boolean;
}

export const ProviderTestPanel = ({
  provider,
  apiKey,
  onTest,
  isTesting
}: ProviderTestPanelProps) => {
  const [activeTab, setActiveTab] = useState('request');
  const [testResponses, setTestResponses] = useState<TestResponse[]>([]);
  const [testOptions, setTestOptions] = useState<any>({});
  const [currentResponse, setCurrentResponse] = useState<TestResponse | null>(null);
  
  const handleTest = async () => {
    try {
      const response = await onTest(apiKey, testOptions);
      setCurrentResponse(response);
      setTestResponses(prev => [response, ...prev].slice(0, 5));
      setActiveTab('response');
    } catch (error: any) {
      const errorResponse: TestResponse = {
        success: false,
        error: error.message || 'Unknown error occurred',
        timestamp: new Date()
      };
      setCurrentResponse(errorResponse);
      setTestResponses(prev => [errorResponse, ...prev].slice(0, 5));
      setActiveTab('response');
    }
  };

  const renderTestOptions = () => {
    // Different providers might have different test options
    switch (provider.serviceKey) {
      case 'openai':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input 
                id="model"
                value={testOptions.model || "gpt-4o"}
                onChange={e => setTestOptions({...testOptions, model: e.target.value})}
                placeholder="Model (e.g. gpt-4o)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">Test Prompt</Label>
              <Input 
                id="prompt"
                value={testOptions.prompt || "Hello, world!"}
                onChange={e => setTestOptions({...testOptions, prompt: e.target.value})}
                placeholder="Enter a test prompt"
              />
            </div>
          </div>
        );
      case 'serpapi':
      case 'dataforseo':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="query">Search Query</Label>
              <Input 
                id="query"
                value={testOptions.query || "digital marketing"}
                onChange={e => setTestOptions({...testOptions, query: e.target.value})}
                placeholder="Enter a search query"
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-4 text-muted-foreground">
            <p>Standard API connection test</p>
            <p className="text-xs mt-1">Basic authentication verification will be performed</p>
          </div>
        );
    }
  };

  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  };

  return (
    <Card className="border border-white/10 shadow-lg mb-4">
      <CardHeader>
        <CardTitle className="text-lg">API Test Console - {provider.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="request">Request</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="request" className="space-y-4">
            {renderTestOptions()}
            
            <Button
              onClick={handleTest}
              disabled={isTesting || !apiKey}
              className="w-full"
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="response">
            {currentResponse ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Badge variant={currentResponse.success ? "success" : "destructive"} className={currentResponse.success ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                    {currentResponse.success ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <X className="h-3 w-3 mr-1" />
                    )}
                    {currentResponse.success ? 'Success' : 'Error'}
                  </Badge>
                  {currentResponse.responseTime && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400">
                      {currentResponse.responseTime}ms
                    </Badge>
                  )}
                </div>
                
                <div className="p-3 bg-black/30 rounded-md border border-white/10">
                  <ScrollArea className="h-48">
                    <pre className="text-xs text-white/80 whitespace-pre-wrap overflow-x-auto">
                      {currentResponse.error ? 
                        currentResponse.error : 
                        formatJson(currentResponse.data)
                      }
                    </pre>
                  </ScrollArea>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tested at: {currentResponse.timestamp.toLocaleString()}</span>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('request')}>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Test Again
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No test has been run yet.</p>
                <Button 
                  variant="link" 
                  onClick={() => setActiveTab('request')}
                  className="mt-2"
                >
                  Run a test
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            {testResponses.length > 0 ? (
              <div className="space-y-4">
                {testResponses.map((response, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-md border cursor-pointer 
                      ${response.success ? 'border-green-500/20' : 'border-red-500/20'}
                      hover:bg-white/5
                    `}
                    onClick={() => {
                      setCurrentResponse(response);
                      setActiveTab('response');
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <Badge variant={response.success ? "success" : "destructive"} className={response.success ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                        {response.success ? 'Success' : 'Error'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(response.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground line-clamp-1">
                      {response.error || (response.data ? '✓ Valid response received' : 'No data')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No test history available.</p>
                <Button 
                  variant="link" 
                  onClick={() => setActiveTab('request')}
                  className="mt-2"
                >
                  Run a test
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
