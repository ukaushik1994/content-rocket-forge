import React, { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { EmptyDataState } from './EmptyDataState';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface SerpDataManagerProps {
  children: React.ReactNode;
  proposal?: any;
  autoLoad?: boolean;
}

export const SerpDataManager: React.FC<SerpDataManagerProps> = ({
  children,
  proposal,
  autoLoad = true
}) => {
  const { state, dispatch, setMainKeyword } = useContentBuilder();
  const { mainKeyword, serpData, isAnalyzing } = state;
  const [dataLoadAttempted, setDataLoadAttempted] = useState(false);
  const [dataSourceStatus, setDataSourceStatus] = useState<'loading' | 'success' | 'error' | 'empty'>('empty');

  // Auto-setup from proposal
  useEffect(() => {
    if (proposal && !mainKeyword && autoLoad) {
      console.log('🎯 Auto-setting up SERP analysis from proposal...');
      
      if (proposal.primary_keyword) {
        setMainKeyword(proposal.primary_keyword);
      }
      
      // Check if proposal has SERP data
      if (proposal.serp_data && Object.keys(proposal.serp_data).length > 0) {
        console.log('📊 Proposal contains SERP data:', Object.keys(proposal.serp_data));
        setDataSourceStatus('success');
        setDataLoadAttempted(true);
      }
    }
  }, [proposal, mainKeyword, autoLoad, setMainKeyword]);

  // Monitor data loading status
  useEffect(() => {
    if (isAnalyzing) {
      setDataSourceStatus('loading');
    } else if (serpData) {
      setDataSourceStatus('success');
      if (!dataLoadAttempted) {
        setDataLoadAttempted(true);
      }
    } else if (dataLoadAttempted && !serpData) {
      setDataSourceStatus('error');
    }
  }, [serpData, isAnalyzing, dataLoadAttempted]);

  // Auto-mark step as completed when we have good data
  useEffect(() => {
    if (serpData && mainKeyword && dataSourceStatus === 'success') {
      const hasValidData = 
        (serpData.entities && serpData.entities.length > 0) ||
        (serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0) ||
        (serpData.keywords && serpData.keywords.length > 0);
      
      if (hasValidData) {
        console.log('✅ SERP analysis has valid data - marking step as analyzed');
        dispatch({ type: 'MARK_STEP_ANALYZED', payload: 2 });
      }
    }
  }, [serpData, mainKeyword, dataSourceStatus, dispatch]);

  const handleRetryDataLoad = () => {
    if (mainKeyword) {
      setDataLoadAttempted(true);
      setDataSourceStatus('loading');
      // The actual retry will be handled by the parent components
      toast.info('Retrying SERP data analysis...');
    }
  };

  const handleSelectKeyword = () => {
    // Navigate to keyword selection step
    dispatch({ type: 'SET_CURRENT_STEP', payload: 0 });
  };

  // Status indicator component
  const DataStatusIndicator = () => {
    if (dataSourceStatus === 'loading') {
      return (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <CardContent className="flex items-center justify-center py-4">
            <RefreshCw className="h-5 w-5 mr-2 animate-spin text-blue-600" />
            <span className="text-blue-800">Loading SERP data...</span>
          </CardContent>
        </Card>
      );
    }
    
    if (dataSourceStatus === 'success' && serpData) {
      return (
        <Card className="mb-4 border-green-200 bg-green-50">
          <CardContent className="flex items-center justify-center py-2">
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            <span className="text-green-800 text-sm">
              SERP analysis loaded for "{mainKeyword}"
            </span>
          </CardContent>
        </Card>
      );
    }
    
    if (dataSourceStatus === 'error') {
      return (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-center py-2">
            <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
            <span className="text-red-800 text-sm">
              Failed to load SERP data
            </span>
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };

  // Show empty states when appropriate
  if (!mainKeyword) {
    return (
      <EmptyDataState
        variant="no-keyword"
        onAction={handleSelectKeyword}
      />
    );
  }

  if (dataLoadAttempted && !serpData && !isAnalyzing) {
    return (
      <EmptyDataState
        variant="api-error"
        onAction={handleRetryDataLoad}
      />
    );
  }

  if (isAnalyzing && !serpData) {
    return (
      <EmptyDataState
        variant="loading"
      />
    );
  }

  return (
    <div className="space-y-4">
      <DataStatusIndicator />
      {children}
    </div>
  );
};