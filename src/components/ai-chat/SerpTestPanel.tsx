import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { runAllSerpTests, testSerpIntegration, testSmartSuggestionsFlow } from '@/utils/serpTestUtils';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface TestResult {
  success: boolean;
  error?: any;
  results?: any;
  contextData?: any;
}

interface FullTestResult {
  serpIntegration: TestResult;
  smartSuggestions: TestResult;
  timestamp: string;
}

export function SerpTestPanel() {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    serpIntegration?: TestResult;
    smartSuggestions?: TestResult;
    fullTest?: FullTestResult;
  }>({});

  const runSerpTest = async () => {
    setTesting(true);
    try {
      const result = await testSerpIntegration('digital marketing');
      setTestResults(prev => ({ ...prev, serpIntegration: result }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, serpIntegration: { success: false, error } }));
    }
    setTesting(false);
  };

  const runSmartSuggestionsTest = async () => {
    if (!user?.id) return;
    
    setTesting(true);
    try {
      const result = await testSmartSuggestionsFlow(user.id);
      setTestResults(prev => ({ ...prev, smartSuggestions: result }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, smartSuggestions: { success: false, error } }));
    }
    setTesting(false);
  };

  const runFullTest = async () => {
    if (!user?.id) return;
    
    setTesting(true);
    try {
      const result = await runAllSerpTests(user.id);
      setTestResults(prev => ({ ...prev, fullTest: result }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        fullTest: { 
          serpIntegration: { success: false, error },
          smartSuggestions: { success: false, error },
          timestamp: new Date().toISOString()
        }
      }));
    }
    setTesting(false);
  };

  const renderTestResult = (title: string, result?: TestResult | FullTestResult) => {
    if (!result) return null;
    
    const success = 'success' in result ? result.success : 
      (result as FullTestResult).serpIntegration?.success && (result as FullTestResult).smartSuggestions?.success;
    
    return (
      <div className="flex items-center gap-2 p-2 rounded border bg-muted/50">
        {success ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">
          {success ? 'Passed' : 'Failed'}
        </span>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">SERP Integration Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Button 
            onClick={runSerpTest}
            disabled={testing}
            variant="outline"
            size="sm"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Test SERP Analysis
          </Button>
          
          <Button 
            onClick={runSmartSuggestionsTest}
            disabled={testing || !user?.id}
            variant="outline"
            size="sm"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Test Smart Suggestions
          </Button>
          
          <Button 
            onClick={runFullTest}
            disabled={testing || !user?.id}
            variant="default"
            size="sm"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Run Full Integration Test
          </Button>
        </div>

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Test Results:</h4>
            {renderTestResult('SERP Analysis', testResults.serpIntegration)}
            {renderTestResult('Smart Suggestions', testResults.smartSuggestions)}
            {renderTestResult('Full Integration', testResults.fullTest)}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          {!user?.id && <p>⚠️ Login required for full testing</p>}
          <p>Tests use mock data when no API keys are configured</p>
        </div>
      </CardContent>
    </Card>
  );
}