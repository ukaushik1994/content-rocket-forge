
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { DataForSeoProvider } from '@/components/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface DataForSeoApiSetupProps {
  onConfigured?: () => void;
}

export const DataForSeoApiSetup: React.FC<DataForSeoApiSetupProps> = ({ onConfigured }) => {
  const provider = {
    id: 'dataforseo',
    name: 'DataForSEO',
    description: 'Enterprise SEO data platform with comprehensive API',
    type: 'credentials' as const,
    docsUrl: 'https://dataforseo.com/apis',
    signupUrl: 'https://app.dataforseo.com/register',
    serviceKey: 'dataforseo',
    autoDetectable: false
  };

  return (
    <Card className="border border-white/10 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">DataForSEO Setup</CardTitle>
        <CardDescription>
          Use DataForSEO for enterprise-level search data and competitive analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 bg-blue-900/20 border-blue-500/30">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertTitle>Enterprise SERP Provider</AlertTitle>
          <AlertDescription>
            DataForSEO is an enterprise-level solution that provides comprehensive SEO data.
            It requires account credentials rather than a simple API key.
          </AlertDescription>
        </Alert>
        
        <DataForSeoProvider 
          provider={provider}
        />
      </CardContent>
    </Card>
  );
};
