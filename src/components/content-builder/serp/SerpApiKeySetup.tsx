
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SerpApiKeySetupProps {
  onApiKeySet: () => void;
}

export const SerpApiKeySetup = ({ onApiKeySet }: SerpApiKeySetupProps) => {
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSetApiKey = async () => {
    if (!apiKey) {
      toast.error('Please enter a valid API key');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save the API key to localStorage (in a real app, this would be handled securely)
      localStorage.setItem('serp_api_key', apiKey);
      
      toast.success('API key saved successfully');
      onApiKeySet();
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error('Failed to save API key');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>SERP API Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To analyze search results, you need to set up your SERP API key.
          </p>
          
          <Input
            type="password"
            placeholder="Enter your SERP API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          
          <Button 
            onClick={handleSetApiKey} 
            disabled={isSubmitting || !apiKey}
            className="w-full"
          >
            {isSubmitting ? 'Saving...' : 'Save API Key'}
          </Button>
          
          <p className="text-xs text-muted-foreground mt-4">
            Don't have a SERP API key? You can get one from 
            <a 
              href="https://serpapi.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-1"
            >
              SerpAPI.com
            </a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
