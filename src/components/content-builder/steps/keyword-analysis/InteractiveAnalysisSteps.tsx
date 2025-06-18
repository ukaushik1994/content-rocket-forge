
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Loader2, TrendingUp, Search, BarChart3, Target, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AnalysisStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'loading' | 'completed' | 'error';
  data?: any;
}

interface InteractiveAnalysisStepsProps {
  keyword: string;
  onAnalysisComplete: (data: any) => void;
  serpData?: any;
  isAnalyzing: boolean;
}

export const InteractiveAnalysisSteps: React.FC<InteractiveAnalysisStepsProps> = ({
  keyword,
  onAnalysisComplete,
  serpData,
  isAnalyzing
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<AnalysisStep[]>([
    {
      id: 'validation',
      title: 'Keyword Validation',
      description: 'Validating keyword format and preparing analysis',
      icon: <Search className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'api-check',
      title: 'API Status Check',
      description: 'Checking available SERP analysis services',
      icon: <BarChart3 className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'search-volume',
      title: 'Search Volume Analysis',
      description: 'Fetching search trends and volume data',
      icon: <TrendingUp className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'serp-features',
      title: 'SERP Features Analysis',
      description: 'Analyzing organic results and SERP features',
      icon: <Target className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'metrics',
      title: 'Metrics Calculation',
      description: 'Computing SEO difficulty and opportunity scores',
      icon: <BarChart3 className="h-5 w-5" />,
      status: 'pending'
    }
  ]);

  // Update steps based on analysis progress
  useEffect(() => {
    if (!isAnalyzing && !serpData) {
      // Reset all steps to pending
      setSteps(prev => prev.map(step => ({ ...step, status: 'pending' as const })));
      setCurrentStep(0);
      return;
    }

    if (isAnalyzing) {
      // Start the analysis simulation
      simulateAnalysisSteps();
    } else if (serpData) {
      // Analysis completed, mark all steps as completed
      setSteps(prev => prev.map(step => ({ 
        ...step, 
        status: 'completed' as const,
        data: getStepData(step.id, serpData)
      })));
      setCurrentStep(steps.length);
      onAnalysisComplete(serpData);
    }
  }, [isAnalyzing, serpData]);

  const simulateAnalysisSteps = async () => {
    const stepDelays = [500, 800, 1200, 1000, 600]; // Realistic timing for each step
    
    for (let i = 0; i < steps.length; i++) {
      // Mark current step as loading
      setCurrentStep(i);
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index === i ? 'loading' : index < i ? 'completed' : 'pending'
      })));

      // Wait for step to complete
      await new Promise(resolve => setTimeout(resolve, stepDelays[i]));

      // Mark step as completed
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index <= i ? 'completed' : 'pending'
      })));
    }
  };

  const getStepData = (stepId: string, data: any) => {
    switch (stepId) {
      case 'validation':
        return { keyword, valid: true };
      case 'api-check':
        return data.data_sources || {};
      case 'search-volume':
        return { 
          volume: data.metrics?.search_volume || 0,
          related_count: data.related_keywords?.length || 0
        };
      case 'serp-features':
        return {
          organic_count: data.serp_blocks?.organic?.length || 0,
          ads_count: data.serp_blocks?.ads?.length || 0,
          features_count: Object.values(data.serp_blocks || {}).filter(Boolean).length
        };
      case 'metrics':
        return data.metrics || {};
      default:
        return {};
    }
  };

  const getProgressPercentage = () => {
    if (!isAnalyzing && !serpData) return 0;
    if (serpData) return 100;
    return ((currentStep + 1) / steps.length) * 100;
  };

  const renderStepContent = (step: AnalysisStep, index: number) => {
    const isActive = currentStep === index;
    const isCompleted = step.status === 'completed';
    const isLoading = step.status === 'loading';

    return (
      <motion.div
        key={step.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-300 ${
          isActive ? 'bg-primary/10 border-l-4 border-l-primary' : 
          isCompleted ? 'bg-green-50 dark:bg-green-900/20' : 
          'bg-muted/30'
        }`}
      >
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isCompleted ? 'bg-green-500 text-white' :
          isLoading ? 'bg-primary text-white' :
          'bg-muted text-muted-foreground'
        }`}>
          {isCompleted ? <CheckCircle className="h-5 w-5" /> :
           isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> :
           step.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${isCompleted ? 'text-green-700 dark:text-green-400' : ''}`}>
            {step.title}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {step.description}
          </p>
          
          {/* Show step-specific data when completed */}
          {isCompleted && step.data && (
            <div className="mt-2 flex flex-wrap gap-1">
              {renderStepBadges(step.id, step.data)}
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          {isCompleted && (
            <Badge variant="success" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Done
            </Badge>
          )}
          {isLoading && (
            <Badge variant="secondary">
              Analyzing...
            </Badge>
          )}
          {step.status === 'pending' && currentStep > index && (
            <Badge variant="outline">
              Queued
            </Badge>
          )}
        </div>
      </motion.div>
    );
  };

  const renderStepBadges = (stepId: string, data: any) => {
    switch (stepId) {
      case 'api-check':
        return (
          <>
            {data.serpapi_available && (
              <Badge variant="outline" className="text-xs">
                SerpApi ✓
              </Badge>
            )}
            {data.serpstack_available && (
              <Badge variant="outline" className="text-xs">
                Serpstack ✓
              </Badge>
            )}
          </>
        );
      case 'search-volume':
        return (
          <>
            <Badge variant="outline" className="text-xs">
              {data.volume.toLocaleString()} searches/mo
            </Badge>
            <Badge variant="outline" className="text-xs">
              {data.related_count} related
            </Badge>
          </>
        );
      case 'serp-features':
        return (
          <>
            <Badge variant="outline" className="text-xs">
              {data.organic_count} organic
            </Badge>
            <Badge variant="outline" className="text-xs">
              {data.ads_count} ads
            </Badge>
          </>
        );
      case 'metrics':
        return (
          <>
            <Badge variant="outline" className="text-xs">
              Difficulty: {data.seo_difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Opportunity: {data.opportunity_score}
            </Badge>
          </>
        );
      default:
        return null;
    }
  };

  if (!keyword) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ready for Analysis</h3>
          <p className="text-muted-foreground">
            Enter a keyword to begin the interactive SERP analysis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            SERP Analysis for "{keyword}"
          </CardTitle>
          {serpData && (
            <Badge variant="success" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Analysis Complete
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => renderStepContent(step, index))}
        </div>

        {serpData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 pt-6 border-t border-border/50"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">
                  {serpData.metrics?.search_volume?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">Monthly Searches</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-orange-500">
                  {serpData.metrics?.seo_difficulty || 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">SEO Difficulty</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-500">
                  {serpData.metrics?.opportunity_score || 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">Opportunity</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-500">
                  {Math.round((serpData.metrics?.competition_pct || 0) * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">Competition</div>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
