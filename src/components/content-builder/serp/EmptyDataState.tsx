import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Settings, Search, Database } from 'lucide-react';

interface EmptyDataStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'no-data' | 'no-keyword' | 'api-error' | 'loading';
  isLoading?: boolean;
}

export const EmptyDataState: React.FC<EmptyDataStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  variant = 'no-data',
  isLoading = false
}) => {
  const getVariantConfig = () => {
    switch (variant) {
      case 'no-keyword':
        return {
          icon: <Search className="h-12 w-12 text-yellow-500" />,
          title: title || 'No Keyword Selected',
          description: description || 'Please select a keyword to analyze SERP data',
          actionLabel: actionLabel || 'Select Keyword',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'api-error':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
          title: title || 'API Error',
          description: description || 'Failed to fetch SERP data. Please check your API configuration',
          actionLabel: actionLabel || 'Configure API',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'loading':
        return {
          icon: <RefreshCw className="h-12 w-12 text-blue-500 animate-spin" />,
          title: title || 'Loading SERP Data',
          description: description || 'Analyzing keyword and fetching comprehensive SERP insights...',
          actionLabel: null,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          icon: <Database className="h-12 w-12 text-gray-500" />,
          title: title || 'No SERP Data Available',
          description: description || 'No SERP analysis data is currently available for this keyword',
          actionLabel: actionLabel || 'Analyze Keyword',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getVariantConfig();

  return (
    <Card className={`min-h-[300px] ${config.bgColor} ${config.borderColor}`}>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex flex-col items-center text-center space-y-4">
          {config.icon}
          <div>
            <CardTitle className="text-lg mb-2">{config.title}</CardTitle>
            <p className="text-muted-foreground text-sm max-w-md">
              {config.description}
            </p>
          </div>
          {config.actionLabel && onAction && (
            <Button 
              onClick={onAction}
              disabled={isLoading}
              className="mt-4"
            >
              {isLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              {config.actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};