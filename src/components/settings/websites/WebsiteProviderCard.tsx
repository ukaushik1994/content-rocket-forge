import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, ExternalLink, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { WebsiteProvider } from './types';
import { WordPressConnection } from './WordPressConnection';
import { WixConnection } from './WixConnection';

interface WebsiteProviderCardProps {
  provider: WebsiteProvider;
  isConnected: boolean;
  onConnectionChange: () => void;
}

export const WebsiteProviderCard = ({ provider, isConnected, onConnectionChange }: WebsiteProviderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    if (isConnected) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusBadge = () => {
    if (isConnected) {
      return <Badge variant="outline" className="text-green-500/70 border-green-500/30">Connected</Badge>;
    }
    return <Badge variant="outline">Not Configured</Badge>;
  };

  return (
    <Card className="p-4 bg-transparent border-border/20">
      <div className="space-y-4">
        {/* Collapsed Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="flex items-center gap-3 p-0 h-auto hover:bg-transparent flex-1 justify-start"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <provider.icon className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{provider.name}</span>
            {getStatusIcon()}
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
            )}
          </Button>
          {getStatusBadge()}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">{provider.description}</p>

            {/* Connection Forms */}
            {provider.provider === 'wordpress' && (
              <WordPressConnection onConnectionChange={onConnectionChange} />
            )}
            {provider.provider === 'wix' && (
              <WixConnection onConnectionChange={onConnectionChange} />
            )}

            {/* Documentation Link */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(provider.documentationLink, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Documentation
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};