
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2, ExternalLink, Settings, RefreshCw } from 'lucide-react';
import { testSerpApiKeyComprehensive } from '@/utils/apiKeyTestUtils';
import { getApiKey } from '@/services/apiKeyService';
import { toast } from 'sonner';

interface DiagnosticResult {
  status: 'success' | 'warning' | 'error' | 'loading';
  message: string;
  details?: string;
}

export const SerpApiDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<{
    apiKey: DiagnosticResult;
    edgeFunction: DiagnosticResult;
    format: DiagnosticResult;
  }>({
    apiKey: { status: 'loading', message: 'Checking API key...' },
    edgeFunction: { status: 'loading', message: 'Testing connection...' },
    format: { status: 'loading', message: 'Validating format...' }
  });
  
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    console.log('🔬 Running SERP API diagnostics...');
    
    try {
      // Check if API key exists
      const apiKey = await getApiKey('serp');
      
      if (!apiKey) {
        setDiagnostics({
          apiKey: { 
            status: 'error', 
            message: 'No API key found',
            details: 'Please add your SERP API key in settings'
          },
          edgeFunction: { 
            status: 'warning', 
            message: 'Cannot test without API key'
          },
          format: { 
            status: 'warning', 
            message: 'Cannot validate format without API key'
          }
        });
        return;
      }

      // API key exists
      setDiagnostics(prev => ({
        ...prev,
        apiKey: { 
          status: 'success', 
          message: 'API key found',
          details: `Length: ${apiKey.length} characters`
        }
      }));

      // Test the API key comprehensively
      const testResult = await testSerpApiKeyComprehensive(apiKey);
      
      // Update format validation
      setDiagnostics(prev => ({
        ...prev,
        format: {
          status: testResult.format.valid ? 'success' : 'warning',
          message: testResult.format.valid ? 'Valid format' : 'Format issue',
          details: testResult.format.format + (testResult.format.suggestions ? 
            ' - ' + testResult.format.suggestions.join(', ') : '')
        }
      }));

      // Update edge function test
      setDiagnostics(prev => ({
        ...prev,
        edgeFunction: {
          status: testResult.edgeFunction.success ? 'success' : 'error',
          message: testResult.edgeFunction.success ? 'Connection successful' : 'Connection failed',
          details: testResult.edgeFunction.error || 'API is responding correctly'
        }
      }));

      console.log('✅ Diagnostics completed:', testResult);
      
    } catch (error) {
      console.error('❌ Diagnostics failed:', error);
      
      setDiagnostics(prev => ({
        ...prev,
        edgeFunction: {
          status: 'error',
          message: 'Diagnostic test failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
      
      toast.error('Diagnostic test encountered an error');
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      success: 'default',
      warning: 'secondary',
      error: 'destructive',
      loading: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status]} className="ml-2">
        {status === 'loading' ? 'Testing...' : status}
      </Badge>
    );
  };

  return (
    <Card className="w-full border-white/10 bg-black/20 backdrop-blur-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            API Diagnostics
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={runDiagnostics}
            disabled={isRunning}
            className="h-7 px-2"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Testing...' : 'Retest'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {Object.entries(diagnostics).map(([key, result]) => (
          <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
            {getStatusIcon(result.status)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium capitalize">
                  {key === 'edgeFunction' ? 'Edge Function' : key}
                </span>
                {getStatusBadge(result.status)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {result.message}
              </p>
              {result.details && (
                <p className="text-xs text-muted-foreground/80 mt-1">
                  {result.details}
                </p>
              )}
            </div>
          </div>
        ))}
        
        <div className="pt-2 border-t border-white/10">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => window.open('/settings', '_blank')}
            >
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => window.open('https://serpapi.com/dashboard', '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              SerpAPI
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
