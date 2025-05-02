
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Eye, EyeOff, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { saveApiKey, getApiKey, testApiKey, deleteApiKey } from '@/services/apiKeyService';
import { useAuth } from '@/contexts/AuthContext';

export const APISettings = () => {
  const [serpAPIKey, setSerpAPIKey] = useState('');
  const [openAIKey, setOpenAIKey] = useState('');
  const [showSerpKey, setShowSerpKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [enableRealTimeData, setEnableRealTimeData] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loadingSerpKey, setLoadingSerpKey] = useState(false);
  const [loadingOpenAIKey, setLoadingOpenAIKey] = useState(false);
  const [testingSerpAPI, setTestingSerpAPI] = useState(false);
  const [testingOpenAI, setTestingOpenAI] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchAPIKeys = async () => {
      if (!user) return;
      
      // Fetch SERP API key
      setLoadingSerpKey(true);
      const serpKey = await getApiKey('serp');
      if (serpKey) setSerpAPIKey(serpKey);
      setLoadingSerpKey(false);
      
      // Fetch OpenAI key
      setLoadingOpenAIKey(true);
      const openaiKey = await getApiKey('openai');
      if (openaiKey) setOpenAIKey(openaiKey);
      setLoadingOpenAIKey(false);
    };
    
    fetchAPIKeys();
  }, [user]);
  
  const handleSaveAPI = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (serpAPIKey) {
      const success = await saveApiKey('serp', serpAPIKey);
      if (success) {
        toast.success('SERP API key saved successfully!');
      }
    }
    
    if (openAIKey) {
      const success = await saveApiKey('openai', openAIKey);
      if (success) {
        toast.success('OpenAI API key saved successfully!');
      }
    }
  };
  
  const handleTestConnection = async (api: string) => {
    try {
      if (api === 'SERP') {
        setTestingSerpAPI(true);
        if (!serpAPIKey) {
          toast.error('Please enter a SERP API key first');
          return;
        }
        await testApiKey('SERP', serpAPIKey);
      } else if (api === 'OpenAI') {
        setTestingOpenAI(true);
        if (!openAIKey) {
          toast.error('Please enter an OpenAI API key first');
          return;
        }
        await testApiKey('OpenAI', openAIKey);
      }
    } catch (error: any) {
      toast.error(`Failed to test ${api} connection: ${error.message}`);
    } finally {
      setTestingSerpAPI(false);
      setTestingOpenAI(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-panel bg-glass">
        <CardHeader>
          <CardTitle>SERP API Configuration</CardTitle>
          <CardDescription>
            Connect to search engine results page data for content optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveAPI}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="serpapi-key">SERP API Key</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setShowSerpKey(!showSerpKey)}
                    disabled={loadingSerpKey}
                  >
                    {showSerpKey ? (
                      <><EyeOff className="h-3 w-3 mr-1" /> Hide</>
                    ) : (
                      <><Eye className="h-3 w-3 mr-1" /> Show</>
                    )}
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="serpapi-key"
                    type={showSerpKey ? 'text' : 'password'}
                    placeholder={loadingSerpKey ? 'Loading...' : 'Enter your SERP API key'}
                    value={serpAPIKey}
                    onChange={(e) => setSerpAPIKey(e.target.value)}
                    className="bg-glass border-border pr-24"
                    disabled={loadingSerpKey}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                    onClick={() => handleTestConnection('SERP')}
                    disabled={testingSerpAPI || !serpAPIKey || loadingSerpKey}
                  >
                    {testingSerpAPI ? (
                      <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Testing</>
                    ) : (
                      'Test Connection'
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  id="enable-serp"
                  checked={enableRealTimeData}
                  onCheckedChange={setEnableRealTimeData}
                />
                <Label htmlFor="enable-serp">Enable real-time SERP data</Label>
              </div>
              
              <div className="bg-background/50 p-3 rounded-md flex items-start space-x-3 mt-2">
                <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Don't have a SERP API key?</p>
                  <p className="text-xs text-muted-foreground">
                    We recommend <a href="https://serpapi.com" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">SerpAPI</a> for real-time search engine data. 
                    Get 100 free searches per month.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card className="glass-panel bg-glass">
        <CardHeader>
          <CardTitle>OpenAI Configuration</CardTitle>
          <CardDescription>
            Connect to OpenAI for AI-powered content generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveAPI}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                    disabled={loadingOpenAIKey}
                  >
                    {showOpenAIKey ? (
                      <><EyeOff className="h-3 w-3 mr-1" /> Hide</>
                    ) : (
                      <><Eye className="h-3 w-3 mr-1" /> Show</>
                    )}
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="openai-key"
                    type={showOpenAIKey ? 'text' : 'password'}
                    placeholder={loadingOpenAIKey ? 'Loading...' : 'Enter your OpenAI API key'}
                    value={openAIKey}
                    onChange={(e) => setOpenAIKey(e.target.value)}
                    className="bg-glass border-border pr-24"
                    disabled={loadingOpenAIKey}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                    onClick={() => handleTestConnection('OpenAI')}
                    disabled={testingOpenAI || !openAIKey || loadingOpenAIKey}
                  >
                    {testingOpenAI ? (
                      <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Testing</>
                    ) : (
                      'Test Connection'
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-refresh"
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                  />
                  <Label htmlFor="auto-refresh">Automatic model selection</Label>
                </div>
                <div className="bg-green-500/20 text-green-500 px-2 py-1 rounded-full text-xs flex items-center">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </div>
              </div>
              
              <div className="bg-background/50 p-3 rounded-md flex items-start space-x-3 mt-2">
                <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Model information</p>
                  <p className="text-xs text-muted-foreground">
                    Using GPT-4 for content generation provides higher quality results. 
                    For cost-effective options, you can switch to GPT-3.5 in the advanced settings.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t pt-4 border-border">
          <Button onClick={handleSaveAPI} className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple">
            Save API Configuration
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
