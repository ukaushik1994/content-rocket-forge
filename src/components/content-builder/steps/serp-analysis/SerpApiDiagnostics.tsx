
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SerpApiTester } from '../../serp/SerpApiTester';
import { SerpDataFlowVisualizer } from '../../serp/SerpDataFlowVisualizer';
import { Badge } from '@/components/ui/badge';
import { 
  Microscope, 
  Activity, 
  Settings,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface SerpApiDiagnosticsProps {
  serpData?: any;
  isLoading?: boolean;
  mainKeyword?: string;
}

export function SerpApiDiagnostics({ 
  serpData = null, 
  isLoading = false,
  mainKeyword = ''
}: SerpApiDiagnosticsProps) {
  const [testData, setTestData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('tester');

  const displayData = testData || serpData;
  const displayLoading = isLoading;

  const getOverallStatus = () => {
    if (!displayData) return { status: 'error', label: 'No Data', color: 'destructive' };
    if (displayData.isMockData) return { status: 'warning', label: 'Mock Data', color: 'secondary' };
    
    const hasQuestions = (displayData.peopleAlsoAsk?.length || 0) > 0;
    const hasSnippets = (displayData.featuredSnippets?.length || 0) > 0;
    const hasResults = (displayData.topResults?.length || 0) >= 3;
    
    if (hasQuestions && hasSnippets && hasResults) {
      return { status: 'success', label: 'Excellent', color: 'default' };
    } else if ((hasQuestions || hasSnippets) && hasResults) {
      return { status: 'partial', label: 'Good', color: 'secondary' };
    } else {
      return { status: 'limited', label: 'Limited', color: 'outline' };
    }
  };

  const handleTestComplete = (data: any) => {
    setTestData(data);
    setActiveTab('flow');
  };

  const status = getOverallStatus();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Microscope className="h-5 w-5" />
            SERP Diagnostics
          </CardTitle>
          <Badge variant={status.color as any} className="flex items-center gap-1">
            {status.status === 'success' && <CheckCircle className="h-3 w-3" />}
            {status.status === 'warning' && <AlertTriangle className="h-3 w-3" />}
            {status.status === 'error' && <AlertTriangle className="h-3 w-3" />}
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tester" className="flex items-center gap-2">
              <Settings className="h-3 w-3" />
              Live Tester
            </TabsTrigger>
            <TabsTrigger value="flow" className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              Data Flow
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <Microscope className="h-3 w-3" />
              Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tester" className="mt-4">
            <SerpApiTester onTestComplete={handleTestComplete} />
          </TabsContent>

          <TabsContent value="flow" className="mt-4">
            <SerpDataFlowVisualizer 
              serpData={displayData} 
              isLoading={displayLoading}
            />
          </TabsContent>

          <TabsContent value="summary" className="mt-4">
            <div className="space-y-4">
              {displayData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Data Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Source:</span>
                        <Badge variant={displayData.isMockData ? 'secondary' : 'default'}>
                          {displayData.isMockData ? 'Mock' : 'Real API'}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Organic Results:</span>
                        <span>{displayData.topResults?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Questions:</span>
                        <span>{displayData.peopleAlsoAsk?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Snippets:</span>
                        <span>{displayData.featuredSnippets?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Entities:</span>
                        <span>{displayData.entities?.length || 0}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Quality Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Minimum Results:</span>
                        {(displayData.topResults?.length || 0) >= 3 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Has Questions:</span>
                        {(displayData.peopleAlsoAsk?.length || 0) > 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Has Snippets:</span>
                        {(displayData.featuredSnippets?.length || 0) > 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Rich Data:</span>
                        {(displayData.entities?.length || 0) > 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No SERP data available. Use the Live Tester to run diagnostics.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
