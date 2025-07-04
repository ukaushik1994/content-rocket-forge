import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Settings, ExternalLink } from 'lucide-react';

interface NoDataAvailableProps {
  keyword: string;
  onManualInput?: () => void;
}

export const NoDataAvailable: React.FC<NoDataAvailableProps> = ({ 
  keyword, 
  onManualInput 
}) => {
  return (
    <div className="space-y-6">
      <Alert className="border-amber-500/20 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-200">
          No SERP data available for "{keyword}". Add your API keys in Settings to get real keyword analysis data.
        </AlertDescription>
      </Alert>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Get Real SERP Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            To unlock powerful keyword analysis with real search data, FAQs, content gaps, and competitive insights, add your SERP API keys.
          </p>
          
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
              <div>
                <h4 className="font-medium">SerpAPI</h4>
                <p className="text-sm text-muted-foreground">Comprehensive Google SERP data</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://serpapi.com/pricing', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Get Key
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
              <div>
                <h4 className="font-medium">Serpstack</h4>
                <p className="text-sm text-muted-foreground">Alternative SERP data provider</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://serpstack.com/pricing', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Get Key
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => window.location.href = '/settings/api'}
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure API Keys
            </Button>
            
            {onManualInput && (
              <Button 
                variant="outline" 
                onClick={onManualInput}
                className="flex-1"
              >
                Continue Without Data
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};