
import React from 'react';
import { Card } from '@/components/ui/card';
import { Settings, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function SerpApiKeyMissing() {
  const navigate = useNavigate();

  return (
    <Card className="h-full min-h-[300px] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-950/20 to-black/20 border border-amber-500/30">
      <div className="text-center space-y-4 max-w-md">
        <div className="bg-amber-900/20 p-3 rounded-full inline-flex mx-auto mb-2">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="text-xl font-medium">SERP API Key Required</h3>
        <p className="text-sm text-muted-foreground">
          To analyze keywords and see search data, you need to add your SERP API key in Settings.
        </p>
        <div className="pt-4">
          <Button 
            onClick={() => navigate('/settings/api')}
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
