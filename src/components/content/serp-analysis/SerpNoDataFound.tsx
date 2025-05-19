
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, AlertTriangle, RefreshCw, CloudOff } from 'lucide-react';

interface SerpNoDataFoundProps {
  mainKeyword: string;
  onRetry?: () => void;
}

export const SerpNoDataFound: React.FC<SerpNoDataFoundProps> = ({ mainKeyword, onRetry }) => {
  // Check if API keys exist
  const serpApiKey = localStorage.getItem('serp_api_key');
  const dataForSeoKey = localStorage.getItem('dataforseo_api_key');
  const hasApiKey = Boolean(serpApiKey || dataForSeoKey);
  
  return (
    <Card className="p-8 h-full flex items-center justify-center">
      <div className="text-center max-w-md mx-auto space-y-4">
        {hasApiKey ? (
          <>
            <CloudOff className="h-16 w-16 mx-auto text-orange-400 opacity-80" />
            <h3 className="text-xl font-medium">No Data Available</h3>
            <p className="text-muted-foreground">
              We couldn't retrieve SERP data for "{mainKeyword}". This could be due to API limits, 
              network issues, or the keyword might be too specific.
            </p>
            {onRetry && (
              <Button 
                onClick={onRetry} 
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </>
        ) : (
          <>
            <AlertTriangle className="h-16 w-16 mx-auto text-yellow-400 opacity-80" />
            <h3 className="text-xl font-medium">API Key Required</h3>
            <p className="text-muted-foreground">
              To view SERP data for "{mainKeyword}", you need to configure an API key for either SERP API or DataForSEO.
            </p>
            {onRetry && (
              <Button 
                onClick={onRetry} 
                className="mt-4"
              >
                Configure API Keys
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
};
