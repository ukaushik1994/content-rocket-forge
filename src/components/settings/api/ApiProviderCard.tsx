
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Eye, 
  EyeOff, 
  Loader, 
  CheckCircle, 
  X, 
  ExternalLink,
  AlertCircle,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ApiProvider } from './types';
import { 
  saveApiKey, 
  getApiKey, 
  testApiKey, 
  deleteApiKey,
  detectApiKeyType
} from '@/services/apiKeyService';

interface ApiProviderCardProps {
  provider: ApiProvider;
  isConfigured: boolean;
  onConfigured: (configured: boolean) => void;
  isLoading?: boolean;
}

export function ApiProviderCard({ 
  provider, 
  isConfigured,
  onConfigured,
  isLoading: externalLoading = false
}: ApiProviderCardProps) {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [testSuccessful, setTestSuccessful] = useState(false);
  const [keyExists, setKeyExists] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardHeight, setCardHeight] = useState<number | null>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);

  // Preserve the card height to prevent layout shifts
  useEffect(() => {
    if (cardRef.current && !cardHeight) {
      setCardHeight(cardRef.current.offsetHeight);
    }
  }, [cardHeight]);

  // Load the API key and test it
  useEffect(() => {
    console.log(`Loading API key for ${provider.name}...`);
    const loadApiKey = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const key = await getApiKey(provider.serviceKey);
        
        if (key) {
          console.log(`API key found for ${provider.name}`);
          setApiKey(key);
          setKeyExists(true);
          setIsActive(true);
          
          // Test the key
          try {
            const success = await testApiKey(provider.serviceKey, key);
            console.log(`${provider.name} API key test result:`, success);
            setTestSuccessful(success);
          } catch (testError) {
            console.error(`Error testing ${provider.name} API key:`, testError);
          }
          
          onConfigured(true);
        } else {
          console.log(`No API key found for ${provider.name}`);
          onConfigured(false);
        }
      } catch (error: any) {
        console.error(`Error loading ${provider.name} API key:`, error);
        setError(error.message || `Failed to load ${provider.name} API key`);
        onConfigured(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Allow external loading state to override internal state
    if (!externalLoading) {
      loadApiKey();
    }
  }, [provider, onConfigured, externalLoading]);

  // Get the provider icon based on service type
  const getProviderIcon = () => {
    switch(provider.serviceKey) {
      case 'openai':
        return <Zap className="h-5 w-5 text-blue-400" />;
      case 'anthropic':
        return <Zap className="h-5 w-5 text-purple-400" />;
      case 'gemini':
        return <Zap className="h-5 w-5 text-emerald-400" />;
      case 'serp':
        return <Zap className="h-5 w-5 text-amber-400" />;
      default:
        return <Zap className="h-5 w-5 text-gray-400" />;
    }
  };

  // Save the API key
  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const success = await saveApiKey(provider.serviceKey, apiKey);
      
      if (success) {
        setKeyExists(true);
        setIsActive(true);
        onConfigured(true);
        toast.success(`${provider.name} API key saved successfully`);
        
        // Test the key after saving
        try {
          const testSuccess = await testApiKey(provider.serviceKey, apiKey);
          setTestSuccessful(testSuccess);
          
          if (!testSuccess) {
            setError(`${provider.name} API key was saved but could not be verified.`);
          }
        } catch (testError: any) {
          console.error(`Error testing ${provider.name} API key after save:`, testError);
          setError(testError.message || `Failed to verify ${provider.name} API key after saving`);
        }
      }
    } catch (error: any) {
      console.error(`Error saving ${provider.name} API key:`, error);
      setError(error.message || `Failed to save ${provider.name} API key`);
      toast.error(error.message || `Failed to save ${provider.name} API key`);
    } finally {
      setIsSaving(false);
    }
  };

  // Test the API key
  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      setError(null);
      
      const success = await testApiKey(provider.serviceKey, apiKey);
      setTestSuccessful(success);
      
      if (success) {
        toast.success(`${provider.name} API connection successful`);
      } else {
        setError(`${provider.name} API key could not be verified.`);
        toast.error(`${provider.name} API connection failed`);
      }
    } catch (error: any) {
      console.error(`Error testing ${provider.name} API key:`, error);
      setError(error.message || `Failed to test ${provider.name} API key`);
      setTestSuccessful(false);
      toast.error(error.message || `Failed to test ${provider.name} API key`);
    } finally {
      setIsTesting(false);
    }
  };

  // Delete the API key
  const handleDeleteKey = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      const success = await deleteApiKey(provider.serviceKey);
      
      if (success) {
        setApiKey("");
        setKeyExists(false);
        setIsActive(false);
        setTestSuccessful(false);
        onConfigured(false);
        toast.success(`${provider.name} API key deleted successfully`);
      }
    } catch (error: any) {
      console.error(`Error deleting ${provider.name} API key:`, error);
      setError(error.message || `Failed to delete ${provider.name} API key`);
      toast.error(error.message || `Failed to delete ${provider.name} API key`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle API key active state
  const handleToggleActive = async () => {
    const newActive = !isActive;
    setIsActive(newActive);
    toast.success(`${provider.name} API ${newActive ? 'enabled' : 'disabled'}`);
  };

  // Auto-detect API key type
  const handleDetectKeyType = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key to detect');
      return;
    }

    try {
      const detectedType = detectApiKeyType(apiKey);
      if (detectedType && detectedType !== provider.serviceKey) {
        toast.info(`This appears to be a ${detectedType.toUpperCase()} API key. Would you like to use it there instead?`);
      } else if (detectedType === provider.serviceKey) {
        toast.success(`Confirmed as a valid ${provider.name} API key format`);
      } else {
        toast.error('Unable to detect API key type');
      }
    } catch (error: any) {
      console.error('Error detecting API key type:', error);
      setError(error.message || 'Failed to detect API key type');
    }
  };

  if (isLoading || externalLoading) {
    return (
      <Card className="border-white/10 bg-glass animate-pulse" style={{ minHeight: cardHeight ? `${cardHeight}px` : 'auto' }}>
        <CardContent className="p-6">
          <div className="h-6 bg-gray-700/40 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-700/40 rounded w-full mb-3"></div>
          <div className="h-10 bg-gray-700/40 rounded w-full mb-4"></div>
          <div className="h-8 bg-gray-700/40 rounded w-1/4"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      ref={cardRef}
      className={`border-white/10 bg-glass ${
        provider.required && !keyExists 
          ? 'border-red-500/40' 
          : testSuccessful 
            ? 'border-green-500/40' 
            : keyExists && !testSuccessful
              ? 'border-amber-500/40'
              : ''
      }`}
      style={{ minHeight: cardHeight ? `${cardHeight}px` : 'auto' }}
    >
      <CardContent className="p-6 space-y-4">
        {/* Provider Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md ${
              testSuccessful 
                ? 'bg-green-500/20' 
                : keyExists && !testSuccessful
                  ? 'bg-amber-500/20'
                  : 'bg-primary/10'
            }`}>
              {getProviderIcon()}
            </div>
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                {provider.name}
                {provider.required && !keyExists && (
                  <Badge variant="destructive" className="text-xs font-normal">Required</Badge>
                )}
                {keyExists && testSuccessful && (
                  <Badge variant="outline" className="text-xs font-normal bg-green-500/10 border-green-500/30 text-green-300">
                    Connected
                  </Badge>
                )}
                {keyExists && !testSuccessful && (
                  <Badge variant="outline" className="text-xs font-normal bg-amber-500/10 border-amber-500/30 text-amber-300">
                    Not Verified
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">{provider.description}</p>
            </div>
          </div>
          
          {keyExists && (
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
              />
            </div>
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-md text-sm text-red-300 flex gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}
        
        {/* Required Notice */}
        {provider.required && !keyExists && (
          <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-md flex gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-300">API Key Required</p>
              <p className="text-xs text-red-300/80 mt-1">
                This API key is required for {provider.name} functionality to work properly.
              </p>
            </div>
          </div>
        )}
        
        {/* API Key Input */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor={`${provider.serviceKey}-api-key`}>API Key</Label>
            <a 
              href={provider.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>Get API key</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="relative">
            <Input
              id={`${provider.serviceKey}-api-key`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type={showApiKey ? "text" : "password"}
              placeholder={`Enter your ${provider.name} API key`}
              className={`pr-10 ${
                provider.required && !keyExists 
                  ? 'border-red-500/50 focus:border-red-500' 
                  : testSuccessful 
                    ? 'border-green-500/50 focus:border-green-500' 
                    : keyExists && !testSuccessful
                      ? 'border-amber-500/50 focus:border-amber-500'
                      : ''
              }`}
            />
            <button
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowApiKey(!showApiKey)}
              type="button"
              aria-label={showApiKey ? "Hide API key" : "Show API key"}
            >
              {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {keyExists ? (
            <>
              <Button 
                variant="secondary"
                onClick={handleTestConnection}
                disabled={isTesting}
                className={`${testSuccessful 
                  ? 'border-green-500/30 text-green-300' 
                  : ''}`}
              >
                {isTesting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : testSuccessful ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Verified
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
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
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
                disabled={isSaving || !apiKey}
                className={`${
                  provider.required 
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600' 
                    : ''
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
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
                  disabled={!apiKey}
                >
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Auto-Detect
                  </>
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
