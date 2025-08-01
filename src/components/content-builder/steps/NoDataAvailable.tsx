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
  return <div className="space-y-6">
      <Alert className="border-amber-500/20 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-200">
          No SERP data available for "{keyword}". Add your API keys in Settings to get real keyword analysis data.
        </AlertDescription>
      </Alert>

      
    </div>;
};