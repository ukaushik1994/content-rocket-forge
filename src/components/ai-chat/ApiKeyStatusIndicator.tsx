import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Settings, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getAllApiKeysStatusSimple } from '@/services/apiKeys/crud';
import { useNavigate } from 'react-router-dom';

interface ApiKeyStatusIndicatorProps {
  className?: string;
}

export const ApiKeyStatusIndicator: React.FC<ApiKeyStatusIndicatorProps> = ({
  className = ''
}) => {
  const [apiKeyStatus, setApiKeyStatus] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    try {
      setIsLoading(true);
      const status = await getAllApiKeysStatusSimple();
      setApiKeyStatus(status);
    } catch (error) {
      console.error('Error checking API key status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const configuredProviders = Object.entries(apiKeyStatus).filter(([, hasKey]) => hasKey);
  const hasAnyKey = configuredProviders.length > 0;

  const handleConfigureClick = () => {
    navigate('/settings', { state: { activeTab: 'ai-settings' } });
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <Clock className="w-4 h-4 animate-spin" />
        <span>Checking API configuration...</span>
      </div>
    );
  }

  if (!hasAnyKey) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={className}
      >
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="font-medium text-amber-800 dark:text-amber-200">
                  API Configuration Required
                </div>
                <div className="text-sm text-amber-700 dark:text-amber-300">
                  Configure at least one AI provider to start using the chat functionality.
                </div>
                <Button
                  onClick={handleConfigureClick}
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure API Keys
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 ${className}`}
    >
      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">AI Providers:</span>
        <div className="flex gap-1">
          {configuredProviders.map(([provider]) => (
            <Badge 
              key={provider} 
              variant="secondary" 
              className="text-xs px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            >
              {provider}
            </Badge>
          ))}
        </div>
      </div>
    </motion.div>
  );
};