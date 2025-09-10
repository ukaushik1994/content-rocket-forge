import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Loader2, TestTube, Zap } from 'lucide-react';
import { toast } from 'sonner';
import AIServiceController from '@/services/aiService/AIServiceController';
import { testAllProviders, testSingleProvider } from '@/services/aiService/testUtils';

export function AIServiceValidator() {
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const handleTestAllProviders = async () => {
    setIsTestingAll(true);
    try {
      await testAllProviders();
      // Refresh provider list after testing
      const providers = await AIServiceController.getActiveProviders();
      setTestResults(providers.map(p => ({
        id: p.id,
        provider: p.provider,
        status: p.status,
        error: p.error_message
      })));
    } finally {
      setIsTestingAll(false);
    }
  };

  const handleTestGeneration = async () => {
    setIsGenerating(true);
    try {
      console.log('🚀 Testing AI content generation...');
      
      const result = await AIServiceController.generate({
        input: 'Write a short paragraph about the benefits of renewable energy',
        use_case: 'content_generation',
        temperature: 0.7,
        max_tokens: 150
      });

      if (result && result.content) {
        toast.success(`✅ Content generation successful using ${result.provider_used}!`);
        console.log('Generated content:', result.content);
      } else {
        toast.error('❌ Content generation failed - no response received');
      }
    } catch (error: any) {
      console.error('💥 Content generation error:', error);
      toast.error(`❌ Content generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-primary" />
          AI Service Validator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test your AI providers and validate the complete workflow
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleTestAllProviders}
            disabled={isTestingAll}
            variant="outline"
            className="flex-1 gap-2"
          >
            {isTestingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {isTestingAll ? 'Testing Providers...' : 'Test All Providers'}
          </Button>
          
          <Button
            onClick={handleTestGeneration}
            disabled={isGenerating}
            className="flex-1 gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {isGenerating ? 'Generating...' : 'Test Content Generation'}
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Provider Status</h4>
            <div className="grid gap-2">
              {testResults.map((result) => (
                <div 
                  key={result.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    {result.status === 'active' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium capitalize">{result.provider}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={result.status === 'active' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {result.status}
                    </Badge>
                    {result.error && (
                      <span className="text-xs text-muted-foreground max-w-48 truncate">
                        {result.error}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <strong>What this tests:</strong><br />
          • Provider API key validation<br />
          • Edge function communication<br />
          • Response parsing and error handling<br />
          • Complete AI generation workflow
        </div>
      </CardContent>
    </Card>
  );
}