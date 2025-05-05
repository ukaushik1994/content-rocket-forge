
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  saveApiKey, 
  getApiKey, 
  testApiKey, 
  deleteApiKey,
  detectApiKeyType 
} from "@/services/apiKeyService";
import { toast } from "sonner";
import { 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Loader2, 
  AlertCircle, 
  Info, 
  Zap,
  Server,
  Database,
  Key
} from 'lucide-react';

// Define the API provider types
export type ApiProvider = {
  id: string;
  name: string;
  description: string;
  serviceKey: string;
  link: string;
  icon: React.ReactNode;
  required?: boolean;
  autoDetectable?: boolean;
};

// List of supported API providers
export const API_PROVIDERS: ApiProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Power AI-assisted content generation, writing assistance, and keyword suggestions.',
    serviceKey: 'openai',
    link: 'https://platform.openai.com/api-keys',
    icon: <Zap className="h-5 w-5" />,
    autoDetectable: true
  },
  {
    id: 'serp',
    name: 'SERP API',
    description: 'Access competitor content analysis, keyword data, and search volume metrics.',
    serviceKey: 'serp',
    link: 'https://serpapi.com/dashboard',
    required: true,
    icon: <Database className="h-5 w-5" />,
    autoDetectable: true
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Use Claude AI for content generation and analysis.',
    serviceKey: 'anthropic',
    link: 'https://console.anthropic.com/settings/keys',
    icon: <Server className="h-5 w-5" />,
    autoDetectable: true
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Leverage Google\'s AI for enhanced content creation.',
    serviceKey: 'gemini',
    link: 'https://aistudio.google.com/app/apikey',
    icon: <Key className="h-5 w-5" />,
    autoDetectable: true
  }
];

interface ApiKeyInputProps {
  provider: ApiProvider;
}

const ApiKeyInput = ({ provider }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [keyExists, setKeyExists] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [testSuccessful, setTestSuccessful] = useState(false);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        setIsLoading(true);
        const key = await getApiKey(provider.serviceKey);
        if (key) {
          setApiKey(key);
          setKeyExists(true);
          setIsActive(true);
          // Try to test the key when loading
          const success = await testApiKey(provider.serviceKey, key);
          setTestSuccessful(success);
        }
      } catch (error) {
        console.error(`Error fetching ${provider.name} API key:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiKey();
  }, [provider]);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }

    try {
      setIsSaving(true);
      const success = await saveApiKey(provider.serviceKey, apiKey);
      if (success) {
        setKeyExists(true);
        setIsActive(true);
        toast.success(`${provider.name} API key saved successfully`);
        
        // Test the key after saving
        const testSuccess = await testApiKey(provider.serviceKey, apiKey);
        setTestSuccessful(testSuccess);
      }
    } catch (error) {
      console.error(`Error saving ${provider.name} API key:`, error);
      toast.error(`Failed to save ${provider.name} API key`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      const success = await testApiKey(provider.serviceKey, apiKey);
      setTestSuccessful(success);
      if (success) {
        toast.success(`${provider.name} connection successful`);
      } else {
        toast.error(`${provider.name} connection failed`);
      }
    } catch (error) {
      console.error(`Error testing ${provider.name} API key:`, error);
      toast.error(`Failed to test ${provider.name} API key`);
      setTestSuccessful(false);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDeleteKey = async () => {
    try {
      setIsDeleting(true);
      const success = await deleteApiKey(provider.serviceKey);
      if (success) {
        setApiKey("");
        setKeyExists(false);
        setIsActive(false);
        setTestSuccessful(false);
        toast.success(`${provider.name} API key deleted successfully`);
      }
    } catch (error) {
      console.error(`Error deleting ${provider.name} API key:`, error);
      toast.error(`Failed to delete ${provider.name} API key`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    const newActive = !isActive;
    setIsActive(newActive);
    
    // In a real implementation, we would update the active status in the database
    toast.success(`${provider.name} API ${newActive ? 'enabled' : 'disabled'} successfully`);
  };

  const handleDetectKeyType = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key to detect');
      return;
    }

    try {
      setIsDetecting(true);
      const detectedType = await detectApiKeyType(apiKey);
      
      if (detectedType && detectedType !== provider.serviceKey) {
        toast.info(`This appears to be a ${detectedType.toUpperCase()} API key. Would you like to use it there instead?`);
      } else if (detectedType === provider.serviceKey) {
        toast.success(`Confirmed as a valid ${provider.name} API key format`);
      } else {
        toast.error('Unable to detect API key type');
      }
    } catch (error) {
      console.error('Error detecting API key type:', error);
      toast.error('Failed to detect API key type');
    } finally {
      setIsDetecting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4 bg-glass border-white/10 animate-pulse">
        <div className="h-5 w-1/3 bg-gray-700 rounded"></div>
        <div className="h-10 w-full bg-gray-700 rounded"></div>
        <div className="h-10 w-1/4 bg-gray-700 rounded"></div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 space-y-4 bg-glass ${provider.required && !keyExists ? 'border-red-500/40' : testSuccessful ? 'border-green-500/40' : 'border-white/10'}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-md ${testSuccessful ? 'bg-green-500/10' : 'bg-primary/10'}`}>
            {provider.icon}
          </div>
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              {provider.name} API
              {provider.required && !keyExists && (
                <span className="bg-red-500/20 text-red-300 text-xs px-2 py-0.5 rounded-full">Required</span>
              )}
              {keyExists && testSuccessful && (
                <span className="bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full">Connected</span>
              )}
              {keyExists && !testSuccessful && (
                <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-0.5 rounded-full">Not Verified</span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">{provider.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex flex-col space-y-0.5">
            <span className="text-xs font-medium">Active</span>
            <span className="text-[10px] text-muted-foreground">
              {isActive ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={handleToggleActive}
            disabled={!keyExists}
          />
        </div>
      </div>
      
      {provider.required && !keyExists && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-500/30">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Key Required</AlertTitle>
          <AlertDescription>
            This API key is required for the content analysis features to work properly. 
            Without it, the application will show "No data found" instead of mock data.
          </AlertDescription>
        </Alert>
      )}
      
      {keyExists && testSuccessful && (
        <Alert className="bg-green-900/20 border-green-500/30">
          <Check className="h-4 w-4 text-green-500" />
          <AlertTitle>API Connected</AlertTitle>
          <AlertDescription>
            Your {provider.name} API key is working correctly. Real data will be used for content analysis.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor={`${provider.serviceKey}-api-key`} className="flex justify-between">
          <span>API Key</span>
          <a 
            href={provider.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <Info className="h-3 w-3" />
            Get API key
          </a>
        </Label>
        <div className="relative">
          <Input
            id={`${provider.serviceKey}-api-key`}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            type={showApiKey ? "text" : "password"}
            placeholder={`Enter your ${provider.name} API key`}
            className={`pr-10 ${provider.required && !keyExists ? 'border-red-500/50 focus:border-red-500' : testSuccessful ? 'border-green-500/50 focus:border-green-500' : ''}`}
          />
          <button
            className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowApiKey(!showApiKey)}
            type="button"
          >
            {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {keyExists ? (
          <>
            <Button 
              variant={testSuccessful ? "outline" : "default"}
              onClick={handleTestConnection}
              disabled={isTesting}
              className={testSuccessful ? "border-green-500/50 text-green-300" : ""}
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : testSuccessful ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Connection Verified
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleDeleteKey}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Delete Key
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <Button 
              onClick={handleSaveKey} 
              className={`bg-gradient-to-r ${provider.required ? 'from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600' : 'from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple'}`}
              disabled={isSaving || !apiKey}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save API Key'
              )}
            </Button>
            
            {provider.autoDetectable && (
              <Button
                variant="outline"
                onClick={handleDetectKeyType}
                disabled={isDetecting || !apiKey}
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Auto-Detect
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export function APISettings() {
  const [selectedProviders, setSelectedProviders] = useState<string[]>(
    API_PROVIDERS.filter(p => p.required).map(p => p.id)
  );
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleProviderToggle = (providerId: string) => {
    setSelectedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId) 
        : [...prev, providerId]
    );
  };

  const filteredProviders = API_PROVIDERS.filter(provider => 
    (provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     provider.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (provider.required || selectedProviders.includes(provider.id))
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">API Integration</h2>
        <p className="text-muted-foreground">
          Connect third-party APIs to enhance content generation and analysis capabilities.
        </p>
      </div>

      <Alert className="bg-blue-900/20 border-blue-500/30">
        <Info className="h-4 w-4" />
        <AlertTitle>Missing API Keys?</AlertTitle>
        <AlertDescription>
          The application will use mock data when API keys are not configured. Add your API keys below for real-time data.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
        </div>
        <div>
          <Select
            onValueChange={(value) => {
              if (value === "all") {
                setSelectedProviders(API_PROVIDERS.map(p => p.id));
              } else if (value === "none") {
                setSelectedProviders(API_PROVIDERS.filter(p => p.required).map(p => p.id));
              } else if (value === "required") {
                setSelectedProviders(API_PROVIDERS.filter(p => p.required).map(p => p.id));
              }
            }}
            defaultValue="required"
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Display options" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Show All</SelectItem>
              <SelectItem value="required">Required Only</SelectItem>
              <SelectItem value="none">Hide Optional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredProviders.map(provider => (
          <ApiKeyInput key={provider.id} provider={provider} />
        ))}
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <h3 className="text-lg font-medium mb-2">Available API Providers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {API_PROVIDERS.filter(p => !p.required && !selectedProviders.includes(p.id)).map(provider => (
            <Card 
              key={provider.id}
              className="p-3 cursor-pointer hover:bg-accent flex items-center gap-3"
              onClick={() => handleProviderToggle(provider.id)}
            >
              <div className="p-2 rounded-md bg-primary/10">
                {provider.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{provider.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-1">{provider.description}</p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProviderToggle(provider.id);
                }}
              >
                Add
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
