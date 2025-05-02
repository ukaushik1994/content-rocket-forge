
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const APISettings = () => {
  const [serpAPIKey, setSerpAPIKey] = useState('');
  const [showSerpKey, setShowSerpKey] = useState(false);
  const [enableRealTimeData, setEnableRealTimeData] = useState(true);
  const [loadingSerpKey, setLoadingSerpKey] = useState(false);
  const [testingSerpAPI, setTestingSerpAPI] = useState(false);
  const { user } = useAuth();
  
  // AI API keys state
  const [aiProvider, setAiProvider] = useState('openai');
  const [openAIKey, setOpenAIKey] = useState('');
  const [googleAIKey, setGoogleAIKey] = useState('');
  const [deepseekAIKey, setDeepseekAIKey] = useState('');
  const [showAIKey, setShowAIKey] = useState(false);
  const [loadingAIKey, setLoadingAIKey] = useState(false);
  const [testingAIApi, setTestingAIApi] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // AI models selection
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  
  const aiProviders = [
    { id: 'openai', name: 'OpenAI', logo: 'openai' },
    { id: 'google', name: 'Google AI', logo: 'google' },
    { id: 'deepseek', name: 'DeepSeek', logo: 'deepseek' },
  ];
  
  const aiModels = {
    openai: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    ],
    google: [
      { id: 'gemini-pro', name: 'Gemini Pro' },
      { id: 'gemini-flash', name: 'Gemini Flash' },
    ],
    deepseek: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder' },
    ]
  };
  
  useEffect(() => {
    const fetchAPIKeys = async () => {
      if (!user) return;
      
      // Fetch SERP API key
      setLoadingSerpKey(true);
      const serpKey = await getApiKey('serp');
      if (serpKey) setSerpAPIKey(serpKey);
      setLoadingSerpKey(false);
      
      // Fetch AI provider keys
      setLoadingAIKey(true);
      const openaiKey = await getApiKey('openai');
      if (openaiKey) setOpenAIKey(openaiKey);
      
      const googleKey = await getApiKey('google');
      if (googleKey) setGoogleAIKey(googleKey);
      
      const deepseekKey = await getApiKey('deepseek');
      if (deepseekKey) setDeepseekAIKey(deepseekKey);
      
      setLoadingAIKey(false);
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
    
    // Save the currently selected AI provider's key
    let aiKey = '';
    let aiService = '';
    
    if (aiProvider === 'openai' && openAIKey) {
      aiKey = openAIKey;
      aiService = 'openai';
    } else if (aiProvider === 'google' && googleAIKey) {
      aiKey = googleAIKey;
      aiService = 'google';
    } else if (aiProvider === 'deepseek' && deepseekAIKey) {
      aiKey = deepseekAIKey;
      aiService = 'deepseek';
    }
    
    if (aiKey) {
      const success = await saveApiKey(aiService, aiKey);
      if (success) {
        toast.success(`${aiService.toUpperCase()} API key saved successfully!`);
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
      } else {
        setTestingAIApi(true);
        let key = '';
        
        if (aiProvider === 'openai') {
          if (!openAIKey) {
            toast.error('Please enter an OpenAI API key first');
            return;
          }
          key = openAIKey;
        } else if (aiProvider === 'google') {
          if (!googleAIKey) {
            toast.error('Please enter a Google AI API key first');
            return;
          }
          key = googleAIKey;
        } else if (aiProvider === 'deepseek') {
          if (!deepseekAIKey) {
            toast.error('Please enter a DeepSeek API key first');
            return;
          }
          key = deepseekAIKey;
        }
        
        await testApiKey(aiProvider.toUpperCase(), key);
      }
    } catch (error: any) {
      toast.error(`Failed to test ${api} connection: ${error.message}`);
    } finally {
      setTestingSerpAPI(false);
      setTestingAIApi(false);
    }
  };
  
  const getCurrentAIKey = () => {
    switch (aiProvider) {
      case 'openai':
        return openAIKey;
      case 'google':
        return googleAIKey;
      case 'deepseek':
        return deepseekAIKey;
      default:
        return '';
    }
  };
  
  const setCurrentAIKey = (value: string) => {
    switch (aiProvider) {
      case 'openai':
        setOpenAIKey(value);
        break;
      case 'google':
        setGoogleAIKey(value);
        break;
      case 'deepseek':
        setDeepseekAIKey(value);
        break;
    }
  };
  
  const getProviderLogo = (providerId: string) => {
    return aiProviders.find(p => p.id === providerId)?.logo || 'openai';
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
          <CardTitle>AI API Configuration</CardTitle>
          <CardDescription>
            Connect to AI models for content generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="openai" value={aiProvider} onValueChange={setAiProvider} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              {aiProviders.map((provider) => (
                <TabsTrigger 
                  key={provider.id} 
                  value={provider.id} 
                  className="flex items-center gap-2"
                >
                  {provider.logo === 'openai' && <openai className="h-4 w-4" />}
                  {provider.logo === 'google' && <google className="h-4 w-4" />}
                  {provider.logo === 'deepseek' && <deepseek className="h-4 w-4" />}
                  {provider.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {aiProviders.map((provider) => (
              <TabsContent key={provider.id} value={provider.id} className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${provider.id}-key`}>{provider.name} API Key</Label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setShowAIKey(!showAIKey)}
                      disabled={loadingAIKey}
                    >
                      {showAIKey ? (
                        <><EyeOff className="h-3 w-3 mr-1" /> Hide</>
                      ) : (
                        <><Eye className="h-3 w-3 mr-1" /> Show</>
                      )}
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id={`${provider.id}-key`}
                      type={showAIKey ? 'text' : 'password'}
                      placeholder={loadingAIKey ? 'Loading...' : `Enter your ${provider.name} API key`}
                      value={
                        provider.id === 'openai' ? openAIKey :
                        provider.id === 'google' ? googleAIKey :
                        deepseekAIKey
                      }
                      onChange={(e) => {
                        if (provider.id === 'openai') setOpenAIKey(e.target.value);
                        else if (provider.id === 'google') setGoogleAIKey(e.target.value);
                        else setDeepseekAIKey(e.target.value);
                      }}
                      className="bg-glass border-border pr-24"
                      disabled={loadingAIKey}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                      onClick={() => handleTestConnection(provider.id)}
                      disabled={testingAIApi || !getCurrentAIKey() || loadingAIKey}
                    >
                      {testingAIApi && aiProvider === provider.id ? (
                        <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Testing</>
                      ) : (
                        'Test Connection'
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="grid gap-2 mt-4">
                  <Label htmlFor={`${provider.id}-model`}>Model Selection</Label>
                  <Select 
                    value={selectedModel} 
                    onValueChange={setSelectedModel}
                    disabled={!getCurrentAIKey()}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {aiModels[provider.id as keyof typeof aiModels].map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between mt-4">
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
                    <p className="text-sm font-medium">API information</p>
                    <p className="text-xs text-muted-foreground">
                      {provider.id === 'openai' && 'Get your OpenAI API key from the OpenAI dashboard. GPT-4o provides higher quality results.'}
                      {provider.id === 'google' && 'Get your Google AI API key from the Google AI Studio. Gemini Pro offers advanced capabilities.'}
                      {provider.id === 'deepseek' && 'Get your DeepSeek API key from the DeepSeek platform. DeepSeek models provide cost-effective AI capabilities.'}
                    </p>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
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
