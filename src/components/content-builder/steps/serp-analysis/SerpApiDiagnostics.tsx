
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, AlertTriangle, RefreshCw, Key, Eye, EyeOff } from 'lucide-react';
import { getApiKey, testApiKey } from '@/services/apiKeyService';
import { validateSerpApiKey, testSerpApiConnection } from '@/utils/apiKeyTestUtils';

type ApiStatus = 'checking' | 'success' | 'error' | 'warning' | 'not-found';

interface DiagnosticStep {
  name: string;
  status: ApiStatus;
  message: string;
  details?: string;
}

export const SerpApiDiagnostics = () => {
  const [steps, setSteps] = useState<DiagnosticStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyDetails, setApiKeyDetails] = useState<{
    exists: boolean;
    length?: number;
    format?: string;
    masked?: string;
  }>({ exists: false });

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setSteps([]);
    
    const diagnosticSteps: DiagnosticStep[] = [];
    
    // Step 1: Check for API key in database
    try {
      diagnosticSteps.push({
        name: 'Database Key Check',
        status: 'checking',
        message: 'Checking for SERP API key in database...'
      });
      setSteps([...diagnosticSteps]);
      
      const storedKey = await getApiKey('serp');
      if (storedKey) {
        const maskedKey = storedKey.substring(0, 6) + '••••••••••••' + 
          (storedKey.length > 16 ? storedKey.substring(storedKey.length - 4) : '');
        
        setApiKeyDetails({
          exists: true,
          length: storedKey.length,
          format: detectKeyFormat(storedKey),
          masked: maskedKey
        });
        
        diagnosticSteps[diagnosticSteps.length - 1] = {
          name: 'Database Key Check',
          status: 'success',
          message: `API key found in database`,
          details: `Length: ${storedKey.length} chars, Format: ${detectKeyFormat(storedKey)}`
        };
      } else {
        diagnosticSteps[diagnosticSteps.length - 1] = {
          name: 'Database Key Check',
          status: 'not-found',
          message: 'No SERP API key found in database'
        };
        setSteps([...diagnosticSteps]);
        setIsRunning(false);
        return;
      }
      setSteps([...diagnosticSteps]);
      
      // Step 2: Validate key format
      diagnosticSteps.push({
        name: 'Key Format Validation',
        status: 'checking',
        message: 'Validating API key format...'
      });
      setSteps([...diagnosticSteps]);
      
      const isValidFormat = validateSerpApiKey(storedKey);
      diagnosticSteps[diagnosticSteps.length - 1] = {
        name: 'Key Format Validation',
        status: isValidFormat ? 'success' : 'warning',
        message: isValidFormat ? 'API key format appears valid' : 'API key format may be invalid',
        details: isValidFormat ? 'Matches expected SerpAPI pattern' : 'Does not match typical SerpAPI patterns'
      };
      setSteps([...diagnosticSteps]);
      
      // Step 3: Test unified API service
      diagnosticSteps.push({
        name: 'Unified Service Test',
        status: 'checking',
        message: 'Testing API key through unified service...'
      });
      setSteps([...diagnosticSteps]);
      
      try {
        const unifiedTestResult = await testApiKey('serp', storedKey);
        diagnosticSteps[diagnosticSteps.length - 1] = {
          name: 'Unified Service Test',
          status: unifiedTestResult ? 'success' : 'error',
          message: unifiedTestResult ? 'Unified service test passed' : 'Unified service test failed',
          details: unifiedTestResult ? 'Key works through api-proxy' : 'Key rejected by api-proxy'
        };
      } catch (error: any) {
        diagnosticSteps[diagnosticSteps.length - 1] = {
          name: 'Unified Service Test',
          status: 'error',
          message: 'Unified service test error',
          details: error.message
        };
      }
      setSteps([...diagnosticSteps]);
      
      // Step 4: Test direct SerpAPI connection
      diagnosticSteps.push({
        name: 'Direct SerpAPI Test',
        status: 'checking',
        message: 'Testing direct connection to SerpAPI...'
      });
      setSteps([...diagnosticSteps]);
      
      try {
        const directTestResult = await testSerpApiConnection(storedKey);
        diagnosticSteps[diagnosticSteps.length - 1] = {
          name: 'Direct SerpAPI Test',
          status: directTestResult.success ? 'success' : 'error',
          message: directTestResult.success ? 'Direct SerpAPI test passed' : 'Direct SerpAPI test failed',
          details: directTestResult.error || 'Direct connection to SerpAPI successful'
        };
      } catch (error: any) {
        diagnosticSteps[diagnosticSteps.length - 1] = {
          name: 'Direct SerpAPI Test',
          status: 'error',
          message: 'Direct SerpAPI test error',
          details: error.message
        };
      }
      setSteps([...diagnosticSteps]);
      
      // Step 5: Test Edge Function
      diagnosticSteps.push({
        name: 'Edge Function Test',
        status: 'checking',
        message: 'Testing SERP edge function...'
      });
      setSteps([...diagnosticSteps]);
      
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase.functions.invoke('serp-api', {
          body: { 
            endpoint: 'test',
            params: { test: true },
            apiKey: storedKey
          }
        });
        
        if (error) {
          diagnosticSteps[diagnosticSteps.length - 1] = {
            name: 'Edge Function Test',
            status: 'error',
            message: 'Edge function test failed',
            details: error.message
          };
        } else if (data && data.success) {
          diagnosticSteps[diagnosticSteps.length - 1] = {
            name: 'Edge Function Test',
            status: 'success',
            message: 'Edge function test passed',
            details: 'SERP edge function is working correctly'
          };
        } else {
          diagnosticSteps[diagnosticSteps.length - 1] = {
            name: 'Edge Function Test',
            status: 'warning',
            message: 'Edge function responded but with warnings',
            details: JSON.stringify(data)
          };
        }
      } catch (error: any) {
        diagnosticSteps[diagnosticSteps.length - 1] = {
          name: 'Edge Function Test',
          status: 'error',
          message: 'Edge function test error',
          details: error.message
        };
      }
      setSteps([...diagnosticSteps]);
      
    } catch (error: any) {
      console.error('Diagnostics error:', error);
      diagnosticSteps.push({
        name: 'Diagnostic Error',
        status: 'error',
        message: `Error during diagnostics: ${error.message}`
      });
      setSteps([...diagnosticSteps]);
    } finally {
      setIsRunning(false);
    }
  };

  const detectKeyFormat = (key: string): string => {
    if (key.match(/^[a-f0-9]{64}$/)) return 'Hex (64 chars)';
    if (key.match(/^[A-Za-z0-9_-]{32,}$/)) return 'Alphanumeric';
    if (key.match(/^[A-Za-z0-9+/]+=*$/)) return 'Base64';
    return 'Unknown';
  };

  const getStatusIcon = (status: ApiStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'not-found':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusText = (status: ApiStatus) => {
    switch (status) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'not-found': return 'Not Found';
      case 'checking': return 'Checking...';
    }
  };

  return (
    <Card className="border border-white/10 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
          Enhanced SERP API Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiKeyDetails.exists && (
          <div className="p-3 bg-white/5 rounded border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">API Key Details</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
                className="h-6 w-6 p-0"
              >
                {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Length: {apiKeyDetails.length} characters</div>
              <div>Format: {apiKeyDetails.format}</div>
              <div className="font-mono">
                Key: {showApiKey ? '(hidden for security)' : apiKeyDetails.masked}
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{step.name}</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(step.status)}
                  <span className="text-xs">{getStatusText(step.status)}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {step.message}
              </div>
              {step.details && (
                <div className="text-xs text-muted-foreground bg-white/5 p-2 rounded border-l-2 border-blue-500/30">
                  {step.details}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full text-xs" 
          disabled={isRunning}
          onClick={runDiagnostics}
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
              Running Enhanced Diagnostics
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-2" />
              Run Enhanced Diagnostics
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
