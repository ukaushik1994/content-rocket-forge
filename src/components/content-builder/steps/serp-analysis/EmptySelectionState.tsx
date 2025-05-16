
import React from 'react';
import { Card } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function EmptySelectionState() {
  const navigate = useNavigate();
  
  const handleNavigateToSettings = () => {
    navigate('/settings/api');
  };
  
  return (
    <Card className="h-full min-h-[200px] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-black/20 to-blue-950/10 border border-white/10">
      <div className="text-center space-y-3">
        <div className="bg-blue-900/20 p-3 rounded-full inline-flex mx-auto mb-2">
          <Settings className="h-6 w-6 text-blue-400" />
        </div>
        <h3 className="text-lg font-medium">No items selected yet</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Select items from the search results to create your content outline.
          If no search data appears, you may need to add your SERP API key.
        </p>
        <Button 
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={handleNavigateToSettings}
        >
          Add API Key
        </Button>
      </div>
    </Card>
  );
}
