
import React from 'react';
import { Card } from '@/components/ui/card';
import { Settings, AlertTriangle, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface SerpApiKeyMissingProps {
  compact?: boolean;
}

export function SerpApiKeyMissing({ compact = false }: SerpApiKeyMissingProps) {
  const navigate = useNavigate();

  const goToApiSettings = () => {
    navigate('/settings/api');
  };

  if (compact) {
    return (
      <Card className="flex items-center gap-4 p-4 bg-gradient-to-br from-amber-950/10 to-black/10 border border-amber-500/30">
        <div className="bg-amber-900/20 p-2 rounded-full">
          <KeyRound className="h-5 w-5 text-amber-500" />
        </div>
        <div className="flex-1 text-sm">
          <h4 className="font-medium mb-1">SERP API Key Required</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Add your SERP API key to see search insights
          </p>
        </div>
        <Button 
          size="sm"
          onClick={goToApiSettings}
          className="whitespace-nowrap"
        >
          <Settings className="mr-2 h-3.5 w-3.5" />
          Add API Key
        </Button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-950/20 to-black/20 border border-amber-500/30 h-full">
      <div className="text-center space-y-4 max-w-md">
        <div className="bg-amber-900/20 p-3 rounded-full inline-flex mx-auto mb-2">
          <KeyRound className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="text-xl font-medium">SERP API Key Required</h3>
        <p className="text-sm text-muted-foreground">
          To analyze keywords and see search data, you need to add your SERP API key in Settings.
        </p>
        <div className="bg-amber-950/20 p-4 rounded-md text-left text-sm space-y-2 border border-amber-700/30">
          <h4 className="font-medium text-amber-400">Troubleshooting Tips:</h4>
          <ul className="list-disc pl-5 space-y-1 text-amber-100/70">
            <li>Make sure your API key is entered correctly without extra spaces</li>
            <li>Check that you're using a valid SERP API key format</li>
            <li>Ensure your API key has sufficient credits/quota remaining</li>
            <li>Try creating a new API key if your current one isn't working</li>
          </ul>
        </div>
        <div className="pt-4">
          <Button 
            onClick={goToApiSettings}
            className="bg-gradient-to-r from-amber-600 to-amber-500"
          >
            <Settings className="mr-2 h-4 w-4" />
            Add SERP API Key
          </Button>
        </div>
      </div>
    </Card>
  );
}
