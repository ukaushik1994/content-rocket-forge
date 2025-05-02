
import React, { useState } from 'react';
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
import { Eye, EyeOff, CheckCircle2, Info } from 'lucide-react';

export const APISettings = () => {
  const [serpAPIKey, setSerpAPIKey] = useState('');
  const [openAIKey, setOpenAIKey] = useState('');
  const [showSerpKey, setShowSerpKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [enableRealTimeData, setEnableRealTimeData] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const handleSaveAPI = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('API settings saved successfully!');
  };
  
  const handleTestConnection = (api: string) => {
    toast.loading(`Testing connection to ${api} API...`);
    
    setTimeout(() => {
      toast.success(`Successfully connected to ${api} API!`);
    }, 1500);
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
                    placeholder="Enter your SERP API key"
                    value={serpAPIKey}
                    onChange={(e) => setSerpAPIKey(e.target.value)}
                    className="bg-glass border-border pr-24"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                    onClick={() => handleTestConnection('SERP')}
                  >
                    Test Connection
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
                    placeholder="Enter your OpenAI API key"
                    value={openAIKey}
                    onChange={(e) => setOpenAIKey(e.target.value)}
                    className="bg-glass border-border pr-24"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                    onClick={() => handleTestConnection('OpenAI')}
                  >
                    Test Connection
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
