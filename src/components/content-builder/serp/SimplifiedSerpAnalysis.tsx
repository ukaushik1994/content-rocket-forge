import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { analyzeKeywordEnhanced, EnhancedSerpResult } from '@/services/enhancedSerpService';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { 
  Search, 
  MessageSquare, 
  FileText, 
  Star, 
  TrendingUp, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { SerpAnalysisPanel } from './SerpAnalysisPanel';

interface SimplifiedSerpAnalysisProps {
  keyword: string;
  onDataUpdate?: (data: EnhancedSerpResult | null) => void;
  proposalData?: any;
}

export const SimplifiedSerpAnalysis: React.FC<SimplifiedSerpAnalysisProps> = ({
  keyword,
  onDataUpdate,
  proposalData
}) => {
  const { state, dispatch } = useContentBuilder();
  const [data, setData] = useState<EnhancedSerpResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Get selected count from context
  const selectedCount = state.serpSelections.filter(item => item.selected).length;

  // Memoize proposal data processing to prevent re-processing
  const processedProposalData = useMemo(() => {
    if (!proposalData || !keyword) return null;

    try {
      const serpDataEntry = proposalData[keyword] || Object.values(proposalData)[0];
      if (!serpDataEntry) return null;

      // Convert to simplified format
      return {
        keyword: serpDataEntry.keyword || keyword,
        searchVolume: serpDataEntry.searchVolume || 1000,
        keywordDifficulty: serpDataEntry.keywordDifficulty || 50,
        keywords: serpDataEntry.keywords || [],
        questions: (serpDataEntry.peopleAlsoAsk || []).map(q => ({
          question: typeof q === 'string' ? q : q.question,
          source: 'proposal'
        })),
        entities: serpDataEntry.entities || [],
        headings: (serpDataEntry.headings || []).map(h => ({
          text: typeof h === 'string' ? h : h.text,
          level: (typeof h === 'object' ? h.level : 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
        })),
        contentGaps: serpDataEntry.contentGaps || [],
        topResults: serpDataEntry.topResults || [],
        relatedSearches: serpDataEntry.relatedSearches || [],
        isMockData: serpDataEntry.isMockData !== false
      };
    } catch (error) {
      console.error('Error processing proposal data:', error);
      return null;
    }
  }, [proposalData, keyword]);

  // Initialize data once
  useEffect(() => {
    if (!keyword || hasInitialized) return;

    const initializeData = async () => {
      setHasInitialized(true);
      
      if (processedProposalData) {
        console.log('📥 Using proposal data for SERP analysis');
        setData(processedProposalData as any);
        onDataUpdate?.(processedProposalData as any);
        addSelectionsFromData(processedProposalData);
        toast.success('SERP data loaded from proposal');
      } else {
        console.log('🔍 Fetching fresh SERP data');
        await fetchData();
      }
    };

    initializeData();
  }, [keyword, processedProposalData, hasInitialized]);

  const addSelectionsFromData = useCallback((serpData: any) => {
    if (!serpData) return;

    const addSelection = (type: string, content: string, metadata?: any) => {
      if (!content || !content.trim()) return;
      
      dispatch({
        type: 'ADD_SERP_SELECTION',
        payload: {
          type,
          content: content.trim(),
          selected: false,
          source: 'serp_analysis',
          metadata
        }
      });
    };

    // Add different types of selections
    serpData.keywords?.forEach((kw: any) => {
      const content = typeof kw === 'string' ? kw : kw.keyword || kw.title;
      addSelection('keyword', content);
    });

    serpData.questions?.forEach((q: any) => {
      const content = typeof q === 'string' ? q : q.question;
      addSelection('question', content);
    });

    serpData.entities?.forEach((entity: any) => {
      const content = typeof entity === 'string' ? entity : entity.name;
      addSelection('entity', content, entity);
    });

    serpData.headings?.forEach((h: any) => {
      const content = typeof h === 'string' ? h : h.text;
      addSelection('heading', content, h);
    });

    serpData.contentGaps?.forEach((gap: any) => {
      const content = typeof gap === 'string' ? gap : gap.topic || gap.description;
      addSelection('contentGap', content, gap);
    });

    console.log('✅ Added selections from SERP data');
  }, [dispatch]);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await analyzeKeywordEnhanced(keyword, 'us', forceRefresh);
      if (result) {
        console.log('📊 Enhanced SERP result received');
        setData(result);
        onDataUpdate?.(result);
        
        // Add selections from fresh data
        addSelectionsFromData(result);
        
        toast.success('SERP analysis completed successfully');
      }
    } catch (error: any) {
      console.error('Error fetching SERP data:', error);
      
      if (error.message?.includes('API key not configured')) {
        toast.error('SERP API key not configured. Please add your SerpAPI key.');
      } else if (error.message?.includes('quota')) {
        toast.error('SERP API quota exceeded. Please check your usage.');
      } else {
        toast.error('Failed to analyze keyword. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [keyword, isLoading, onDataUpdate, addSelectionsFromData]);

  const handleRefresh = useCallback(() => {
    setData(null);
    setHasInitialized(false);
    fetchData(true);
  }, [fetchData]);

  const handleToggleSelection = useCallback((type: string, content: string) => {
    dispatch({
      type: 'TOGGLE_SERP_SELECTION',
      payload: { 
        id: `${type}-${Date.now()}`,
        type, 
        content 
      }
    });
  }, [dispatch]);

  // Show loading state
  if (isLoading && !data) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Analyzing SERP Data
          </CardTitle>
          <CardDescription>
            Analyzing search results for "{keyword}"...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-muted-foreground">This may take a few moments...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show no data state
  if (!data && !isLoading) {
    return (
      <Card className="border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            No SERP Data Available
          </CardTitle>
          <CardDescription>
            Unable to load SERP data for "{keyword}"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We couldn't retrieve search engine results data. This might be due to API configuration or connectivity issues.
          </p>
          <Button onClick={handleRefresh} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show SERP analysis results
  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              SERP Analysis Results
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedCount} Selected
              </Badge>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Keyword: "{keyword}" • {data?.isMockData ? 'Proposal Data' : 'Live Data'}
          </CardDescription>
        </CardHeader>
        {data && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{data.searchVolume?.toLocaleString() || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Search Volume</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{data.keywordDifficulty || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Difficulty</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{data.keywords?.length || 0}</div>
                <div className="text-xs text-muted-foreground">Keywords</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{data.questions?.length || 0}</div>
                <div className="text-xs text-muted-foreground">Questions</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* SERP Analysis Panel */}
      {data && (
        <SerpAnalysisPanel
          serpData={{
            keyword: data.keyword,
            searchVolume: data.searchVolume,
            keywordDifficulty: data.keywordDifficulty,
            competitionScore: data.competitionScore || 0.5,
            entities: data.entities || [],
            peopleAlsoAsk: data.questions?.map(q => ({
              question: q.question,
              source: q.source || 'serp'
            })) || [],
            headings: data.headings?.map(h => ({
              text: h.text,
              level: h.level,
              subtext: h.subtext || ''
            })) || [],
            contentGaps: data.contentGaps?.map(gap => ({
              topic: typeof gap === 'string' ? gap : gap.topic || '',
              description: typeof gap === 'string' ? gap : gap.description || gap.topic || '',
              recommendation: typeof gap === 'object' ? gap.opportunity || '' : '',
              content: typeof gap === 'object' ? gap.description || '' : '',
              source: typeof gap === 'object' ? gap.source || 'serp' : 'serp'
            })) || [],
            topResults: data.serp_blocks?.organic?.slice(0, 10)?.map((result, index) => ({
              title: result.title || '',
              link: result.link || '',
              snippet: result.snippet || '',
              position: index + 1
            })) || [],
            relatedSearches: data.related_keywords?.map(kw => ({
              query: typeof kw === 'string' ? kw : kw.title,
              volume: typeof kw === 'object' ? kw.volume : undefined
            })) || [],
            keywords: data.keywords || [],
            recommendations: data.recommendations || [],
            isMockData: data.isMockData
          }}
          isLoading={isLoading}
          onAddToContent={handleToggleSelection}
          onRetry={async () => handleRefresh()}
        />
      )}
    </div>
  );
};