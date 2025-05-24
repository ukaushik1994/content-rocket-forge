
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Database, 
  Globe, 
  Monitor, 
  CheckCircle, 
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface DataFlowStep {
  id: string;
  name: string;
  status: 'success' | 'warning' | 'error' | 'pending';
  data?: any;
  icon: React.ReactNode;
  description: string;
}

interface SerpDataFlowVisualizerProps {
  serpData: any;
  isLoading: boolean;
}

export function SerpDataFlowVisualizer({ serpData, isLoading }: SerpDataFlowVisualizerProps) {
  const getDataFlowSteps = (): DataFlowStep[] => {
    const steps: DataFlowStep[] = [
      {
        id: 'api',
        name: 'SerpAPI Call',
        status: isLoading ? 'pending' : serpData ? 'success' : 'error',
        icon: <Globe className="h-4 w-4" />,
        description: 'Fetch search results from SerpAPI',
        data: serpData ? { 
          hasData: true, 
          isMockData: serpData.isMockData,
          totalResults: serpData.topResults?.length || 0
        } : null
      },
      {
        id: 'extraction',
        name: 'Data Extraction',
        status: isLoading ? 'pending' : serpData ? 'success' : 'error',
        icon: <Database className="h-4 w-4" />,
        description: 'Extract and transform raw API response',
        data: serpData ? {
          questionsExtracted: serpData.peopleAlsoAsk?.length || 0,
          snippetsExtracted: serpData.featuredSnippets?.length || 0,
          entitiesExtracted: serpData.entities?.length || 0,
          headingsExtracted: serpData.headings?.length || 0
        } : null
      },
      {
        id: 'validation',
        name: 'Data Validation',
        status: isLoading ? 'pending' : serpData ? 
          (getValidationStatus(serpData) === 'good' ? 'success' : 
           getValidationStatus(serpData) === 'partial' ? 'warning' : 'error') : 'error',
        icon: <CheckCircle className="h-4 w-4" />,
        description: 'Validate extracted data quality',
        data: serpData ? getValidationData(serpData) : null
      },
      {
        id: 'frontend',
        name: 'Frontend Display',
        status: isLoading ? 'pending' : serpData ? 'success' : 'error',
        icon: <Monitor className="h-4 w-4" />,
        description: 'Render data in UI components',
        data: serpData ? {
          componentsRendered: getRenderedComponents(serpData),
          selectableItems: getSelectableItemsCount(serpData)
        } : null
      }
    ];

    return steps;
  };

  const getValidationStatus = (data: any): 'good' | 'partial' | 'poor' => {
    const hasQuestions = (data.peopleAlsoAsk?.length || 0) > 0;
    const hasSnippets = (data.featuredSnippets?.length || 0) > 0;
    const hasEntities = (data.entities?.length || 0) > 0;
    const hasResults = (data.topResults?.length || 0) >= 3;

    const validDataCount = [hasQuestions, hasSnippets, hasEntities, hasResults].filter(Boolean).length;
    
    if (validDataCount >= 3) return 'good';
    if (validDataCount >= 2) return 'partial';
    return 'poor';
  };

  const getValidationData = (data: any) => {
    return {
      hasMinimumResults: (data.topResults?.length || 0) >= 3,
      hasQuestions: (data.peopleAlsoAsk?.length || 0) > 0,
      hasSnippets: (data.featuredSnippets?.length || 0) > 0,
      hasEntities: (data.entities?.length || 0) > 0,
      hasRelatedSearches: (data.relatedSearches?.length || 0) > 0
    };
  };

  const getRenderedComponents = (data: any) => {
    const components = [];
    if (data.peopleAlsoAsk?.length > 0) components.push('Questions Section');
    if (data.featuredSnippets?.length > 0) components.push('Featured Snippets');
    if (data.entities?.length > 0) components.push('Entities Section');
    if (data.headings?.length > 0) components.push('Headings Section');
    if (data.contentGaps?.length > 0) components.push('Content Gaps');
    return components;
  };

  const getSelectableItemsCount = (data: any) => {
    return (data.peopleAlsoAsk?.length || 0) + 
           (data.featuredSnippets?.length || 0) + 
           (data.entities?.length || 0) + 
           (data.headings?.length || 0) +
           (data.contentGaps?.length || 0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <div className="h-4 w-4 rounded-full border-2 border-muted animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-500 bg-green-50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      case 'pending':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const steps = getDataFlowSteps();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5" />
          SERP Data Flow Visualization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-8 bg-border" />
              )}
              
              {/* Step Card */}
              <div className={`p-4 border-2 rounded-lg transition-all ${getStatusColor(step.status)}`}>
                <div className="flex items-start gap-3">
                  {/* Step Icon */}
                  <div className="flex-shrink-0 p-2 bg-white rounded-full border">
                    {step.icon}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{step.name}</h3>
                      {getStatusIcon(step.status)}
                      <Badge variant="outline" className="ml-auto">
                        Step {index + 1}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    
                    {/* Step Data */}
                    {step.data && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {Object.entries(step.data).map(([key, value]) => (
                          <div key={key} className="bg-white/80 p-2 rounded border">
                            <div className="font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </div>
                            <div className="text-muted-foreground">
                              {Array.isArray(value) ? value.join(', ') : 
                               typeof value === 'boolean' ? (value ? '✓' : '✗') :
                               String(value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary */}
        {serpData && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Flow Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Data Source</div>
                <div className="text-muted-foreground">
                  {serpData.isMockData ? 'Mock Data' : 'Real SERP API'}
                </div>
              </div>
              <div>
                <div className="font-medium">Total Items</div>
                <div className="text-muted-foreground">
                  {getSelectableItemsCount(serpData)} selectable
                </div>
              </div>
              <div>
                <div className="font-medium">Components</div>
                <div className="text-muted-foreground">
                  {getRenderedComponents(serpData).length} rendered
                </div>
              </div>
              <div>
                <div className="font-medium">Quality</div>
                <div className="text-muted-foreground">
                  {getValidationStatus(serpData)} data quality
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
