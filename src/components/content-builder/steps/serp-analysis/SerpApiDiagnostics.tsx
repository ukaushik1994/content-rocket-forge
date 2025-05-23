
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { getApiKey, testApiKey } from '@/services/apiKeyService';

type ApiStatus = 'checking' | 'success' | 'error' | 'warning' | 'not-found';

export const SerpApiDiagnostics = () => {
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiStatus>('checking');
  const [proxyStatus, setProxyStatus] = useState<ApiStatus>('checking');
  const [directStatus, setDirectStatus] = useState<ApiStatus>('checking');
  const [message, setMessage] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  // Run diagnostics on component mount
  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setIsRunning(true);
    
    // Check for API key
    try {
      setApiKeyStatus('checking');
      setMessage('Checking for SERP API key...');
      
      // Check if we have a key in settings using unified API key service
      try {
        const storedKey = await getApiKey('serp');
        if (storedKey) {
          setApiKeyStatus('success');
          setMessage('Found SERP API key in settings');
          
          // Test the key if it exists
          const success = await testApiKey('serp', storedKey);
          if (success) {
            setApiKeyStatus('success');
            setMessage('SERP API key tested successfully');
          } else {
            setApiKeyStatus('warning');
            setMessage('SERP API key found but test failed');
          }
        } else {
          setApiKeyStatus('not-found');
          setMessage('No SERP API key found. You will see mock data.');
        }
      } catch (error) {
        setApiKeyStatus('error');
        setMessage('Error checking for API key in settings');
      }
      
      // Check proxy endpoint
      setProxyStatus('checking');
      setMessage('Checking proxy endpoint...');
      try {
        // Use supabase functions to test the endpoint
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase.functions.invoke('serp-api', {
          body: { 
            endpoint: 'test',
            params: { test: true } 
          }
        });
        
        if (error) {
          setProxyStatus('error');
          setMessage('SERP API proxy endpoint error: ' + error.message);
          console.error('SERP API proxy endpoint error:', error);
        } else if (data && data.success) {
          setProxyStatus('success');
          setMessage('SERP API proxy endpoint is working');
        } else {
          setProxyStatus('warning');
          setMessage('SERP API proxy endpoint responded but returned an error or no data');
          console.warn('SERP API proxy endpoint response:', data);
        }
      } catch (error) {
        setProxyStatus('error');
        setMessage('Error checking SERP API proxy endpoint: ' + (error.message || 'Unknown error'));
        console.error('Error checking SERP API proxy endpoint:', error);
      }
      
      // Check direct API access (based on API key availability)
      setDirectStatus('checking');
      setMessage('Checking direct API access capabilities...');
      
      const apiKey = await getApiKey('serp');
      if (apiKey) {
        setDirectStatus('warning');
        setMessage('API key found. Direct API access capabilities available as fallback.');
      } else {
        setDirectStatus('error');
        setMessage('No API key found for direct API access capabilities.');
      }
      
    } catch (error: any) {
      setApiKeyStatus('error');
      setMessage(`Error during diagnostics: ${error.message || 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: ApiStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'not-found':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
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
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
          SERP API Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">API Key Status</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(apiKeyStatus)}
              <span className="text-xs">{getStatusText(apiKeyStatus)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Proxy Endpoint</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(proxyStatus)}
              <span className="text-xs">{getStatusText(proxyStatus)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Direct API Access</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(directStatus)}
              <span className="text-xs">{getStatusText(directStatus)}</span>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground border-t border-white/10 pt-2">
          {message}
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
              Running Diagnostics
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-2" />
              Run Diagnostics
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
