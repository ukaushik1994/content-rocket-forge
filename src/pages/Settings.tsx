
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Save,
  Key,
  User,
  Globe,
  Bell,
  LineChart,
  Shield,
} from 'lucide-react';

const Settings = () => {
  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gradient">Settings</h1>
            <Button className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>Navigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Key className="mr-2 h-4 w-4" />
                    API Keys
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Globe className="mr-2 h-4 w-4" />
                    Integrations
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <LineChart className="mr-2 h-4 w-4" />
                    Analytics
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Privacy & Security
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    Connect your SEO data sources and AI providers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">SERP API</h3>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="serp-provider">Provider</Label>
                        <Select defaultValue="ahrefs">
                          <SelectTrigger className="bg-glass border-white/10">
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ahrefs">Ahrefs</SelectItem>
                            <SelectItem value="semrush">SEMrush</SelectItem>
                            <SelectItem value="moz">Moz</SelectItem>
                            <SelectItem value="dataforseo">DataForSEO</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="serp-api-key">API Key</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="serp-api-key" 
                            type="password" 
                            placeholder="Enter API key" 
                            className="flex-1 bg-glass border-white/10"
                          />
                          <Button variant="outline">Verify</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          This API key is used to fetch keyword and SERP data.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">AI Provider</h3>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ai-provider">Provider</Label>
                        <Select defaultValue="openai">
                          <SelectTrigger className="bg-glass border-white/10">
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="openai">OpenAI</SelectItem>
                            <SelectItem value="gemini">Google Gemini</SelectItem>
                            <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ai-api-key">API Key</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="ai-api-key" 
                            type="password" 
                            placeholder="Enter API key" 
                            className="flex-1 bg-glass border-white/10"
                          />
                          <Button variant="outline">Verify</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          This API key is used for content generation and analysis.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Google Search Console</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="gsc-integration" className="flex items-center gap-2">
                          Enable integration
                          <span className="bg-green-500/20 text-green-500 text-xs rounded-full px-2 py-0.5">
                            Recommended
                          </span>
                        </Label>
                        <Switch id="gsc-integration" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Connect to Google Search Console to track content performance.
                      </p>
                      <Button variant="outline" className="w-full mt-2">
                        Connect Google Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>Content Settings</CardTitle>
                  <CardDescription>
                    Configure your content generation preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-faq" className="flex-1">
                        <div className="font-medium">Include FAQ Section</div>
                        <p className="text-xs text-muted-foreground">Automatically pull "People Also Ask" questions</p>
                      </Label>
                      <Switch id="include-faq" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="internal-linking" className="flex-1">
                        <div className="font-medium">Auto Internal Linking</div>
                        <p className="text-xs text-muted-foreground">Suggest relevant internal links from your content</p>
                      </Label>
                      <Switch id="internal-linking" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="solution-integration" className="flex-1">
                        <div className="font-medium">Solution Integration</div>
                        <p className="text-xs text-muted-foreground">Include your solutions in generated content</p>
                      </Label>
                      <Switch id="solution-integration" defaultChecked />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="word-count">Default Word Count</Label>
                      <Select defaultValue="2000">
                        <SelectTrigger className="bg-glass border-white/10">
                          <SelectValue placeholder="Select word count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1000">1,000 words (Brief)</SelectItem>
                          <SelectItem value="1500">1,500 words (Standard)</SelectItem>
                          <SelectItem value="2000">2,000 words (Detailed)</SelectItem>
                          <SelectItem value="2500">2,500+ words (Comprehensive)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="content-tone">Content Tone</Label>
                      <Select defaultValue="professional">
                        <SelectTrigger className="bg-glass border-white/10">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="conversational">Conversational</SelectItem>
                          <SelectItem value="authoritative">Authoritative</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
