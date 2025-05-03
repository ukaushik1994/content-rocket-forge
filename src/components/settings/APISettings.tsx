
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { saveApiKey, getApiKey, testApiKey, deleteApiKey } from "@/services/apiKeyService";
import { toast } from "sonner";
import { Eye, EyeOff, Check, X, Loader2, AlertCircle, Info } from 'lucide-react';

interface ApiKeyInputProps {
  serviceName: string;
  serviceKey: string;
  serviceDescription: string;
  serviceLink: string;
  required?: boolean;
}

const ApiKeyInput = ({ 
  serviceName, 
  serviceKey, 
  serviceDescription, 
  serviceLink, 
  required = false 
}: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [keyExists, setKeyExists] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        setIsLoading(true);
        const key = await getApiKey(serviceKey);
        if (key) {
          setApiKey(key);
          setKeyExists(true);
          setIsActive(true);
        }
      } catch (error) {
        console.error(`Error fetching ${serviceName} API key:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiKey();
  }, [serviceKey, serviceName]);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }

    try {
      setIsSaving(true);
      const success = await saveApiKey(serviceKey, apiKey);
      if (success) {
        setKeyExists(true);
        setIsActive(true);
        toast.success(`${serviceName} API key saved successfully`);
      }
    } catch (error) {
      console.error(`Error saving ${serviceName} API key:`, error);
      toast.error(`Failed to save ${serviceName} API key`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      const success = await testApiKey(serviceKey, apiKey);
      if (success) {
        toast.success(`${serviceName} connection successful`);
      } else {
        toast.error(`${serviceName} connection failed`);
      }
    } catch (error) {
      console.error(`Error testing ${serviceName} API key:`, error);
      toast.error(`Failed to test ${serviceName} API key`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDeleteKey = async () => {
    try {
      setIsDeleting(true);
      const success = await deleteApiKey(serviceKey);
      if (success) {
        setApiKey("");
        setKeyExists(false);
        setIsActive(false);
        toast.success(`${serviceName} API key deleted successfully`);
      }
    } catch (error) {
      console.error(`Error deleting ${serviceName} API key:`, error);
      toast.error(`Failed to delete ${serviceName} API key`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = () => {
    setIsActive(!isActive);
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
    <Card className={`p-6 space-y-4 bg-glass ${required && !keyExists ? 'border-red-500/40' : 'border-white/10'}`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            {serviceName} API
            {required && !keyExists && (
              <span className="bg-red-500/20 text-red-300 text-xs px-2 py-0.5 rounded-full">Required</span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">{serviceDescription}</p>
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
      
      {required && !keyExists && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-500/30">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Key Required</AlertTitle>
          <AlertDescription>
            This API key is required for the content analysis features to work properly. 
            Without it, the application will use mock data instead.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor={`${serviceKey}-api-key`} className="flex justify-between">
          <span>API Key</span>
          <a 
            href={serviceLink} 
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
            id={`${serviceKey}-api-key`}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            type={showApiKey ? "text" : "password"}
            placeholder={`Enter your ${serviceName} API key`}
            className={`pr-10 ${required && !keyExists ? 'border-red-500/50 focus:border-red-500' : ''}`}
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
              variant="outline" 
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
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
          <Button 
            onClick={handleSaveKey} 
            className={`bg-gradient-to-r ${required ? 'from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600' : 'from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple'}`}
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
        )}
      </div>
    </Card>
  );
};

export function APISettings() {
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

      <div className="space-y-4">
        <ApiKeyInput
          serviceName="OpenAI"
          serviceKey="openai"
          serviceDescription="Power AI-assisted content generation, writing assistance, and keyword suggestions."
          serviceLink="https://platform.openai.com/api-keys"
        />

        <ApiKeyInput
          serviceName="SERP API"
          serviceKey="serp"
          serviceDescription="Access competitor content analysis, keyword data, and search volume metrics."
          serviceLink="https://serpapi.com/dashboard"
          required={true}
        />
      </div>
    </div>
  );
}
