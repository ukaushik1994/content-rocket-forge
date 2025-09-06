import React from 'react';
import { SerpAnalysisPanel as CoreSerpAnalysisPanel } from '@/components/content/SerpAnalysisPanel';
import { SerpAnalysisResult } from '@/types/serp';
import { toast } from 'sonner';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

interface SerpAnalysisPanelProps {
  serpData: SerpAnalysisResult | null;
  isLoading: boolean;
  mainKeyword: string;
  onAddToContent?: (content: string, type: string) => void;
  onRetry?: () => void;
  onSerpDataChange?: (data: SerpAnalysisResult | null) => void;
  proposalData?: any;
}

export function SerpAnalysisPanel(props: SerpAnalysisPanelProps) {
  const { 
    serpData, 
    mainKeyword, 
    onSerpDataChange = () => {},
    isLoading: externalLoading,
    proposalData
  } = props;
  
  const [isLocalLoading, setIsLocalLoading] = React.useState(false);
  const [dataSource, setDataSource] = React.useState<'real' | 'mock' | 'loading' | 'proposal' | null>(null);
  const isLoading = externalLoading || isLocalLoading;

  console.log('🔍 SerpAnalysisPanel debug:', {
    mainKeyword,
    hasSerpData: !!serpData,
    hasProposalData: !!proposalData,
    proposalKeys: proposalData ? Object.keys(proposalData) : 'none',
    isLoading
  });

  const convertProposalToSerpData = (serpDataEntry: any, keyword: string): SerpAnalysisResult => {
    return {
      keyword: serpDataEntry.keyword || keyword,
      searchVolume: serpDataEntry.searchVolume || 1000,
      keywordDifficulty: serpDataEntry.keywordDifficulty || 50,
      competitionScore: serpDataEntry.competitionScore || 0.5,
      entities: serpDataEntry.entities || [],
      peopleAlsoAsk: (serpDataEntry.peopleAlsoAsk || []).map(q => ({
        question: typeof q === 'string' ? q : q.question,
        source: typeof q === 'object' ? q.source || 'proposal' : 'proposal'
      })),
      headings: (serpDataEntry.headings || []).map(h => ({
        text: typeof h === 'string' ? h : h.text,
        level: (typeof h === 'object' ? h.level : 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
        subtext: typeof h === 'object' ? h.subtext : ''
      })),
      contentGaps: serpDataEntry.contentGaps || [],
      topResults: (serpDataEntry.topResults || []).map((result, index) => ({
        title: result.title || '',
        link: result.link || '',
        snippet: result.snippet || '',
        position: result.position || index + 1
      })),
      relatedSearches: (serpDataEntry.relatedSearches || serpDataEntry.keywords || []).map(kw => ({
        query: typeof kw === 'string' ? kw : kw.query || kw.keyword,
        volume: typeof kw === 'object' ? kw.volume : undefined
      })),
      keywords: serpDataEntry.keywords || [],
      recommendations: serpDataEntry.recommendations || [],
      isMockData: false // Proposal data is considered real
    };
  };

  const fetchSerpData = async () => {
    if (!mainKeyword || serpData || isLoading) return;
    
    setIsLocalLoading(true);
    setDataSource('loading');
    try {
      console.log("🔄 Fetching SERP data via API for:", mainKeyword);
      const data = await analyzeKeywordSerp(mainKeyword);
      if (data) {
        onSerpDataChange(data);
        
        if (data.isMockData) {
          setDataSource('mock');
          toast.warning("Using mock data. Add your SERP API key for real results.", {
            duration: 5000,
            action: {
              label: "Add Key",
              onClick: () => {
                window.location.href = "/content-builder?step=2&showApiSetup=true";
              }
            }
          });
        } else {
          setDataSource('real');
          toast.success("SERP analysis completed with real data!");
        }
      }
    } catch (error) {
      console.error('❌ Error fetching SERP data:', error);
      toast.error("Failed to fetch SERP data. Please try again.");
    } finally {
      setIsLocalLoading(false);
    }
  };

  // Check for proposal data first, then try API call
  React.useEffect(() => {
    const loadData = async () => {
      if (!mainKeyword) return;

      // First try to use proposal data if available
      if (proposalData && !serpData) {
        console.log('📥 Loading SERP data from proposal...');
        try {
          const targetKeyword = mainKeyword;
          let serpDataEntry = proposalData[targetKeyword] || Object.values(proposalData)[0];
          
          if (serpDataEntry) {
            const convertedData = convertProposalToSerpData(serpDataEntry, targetKeyword);
            onSerpDataChange(convertedData);
            setDataSource('proposal');
            toast.success('SERP data loaded from proposal');
            return;
          }
        } catch (error) {
          console.error('❌ Error loading proposal data:', error);
        }
      }

      // Fallback to API call if no proposal data or serpData
      if (!serpData && !isLoading) {
        await fetchSerpData();
      }
    };

    loadData();
  }, [mainKeyword, proposalData, serpData, isLoading]);

  // Data source indicator
  const getDataSourceBadge = () => {
    if (isLoading) return null;
    
    switch (dataSource) {
      case 'real':
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            <Info className="h-3 w-3 mr-1" />
            Real Data
          </Badge>
        );
      case 'proposal':
        return (
          <Badge variant="secondary" className="bg-blue-600 hover:bg-blue-700">
            <Info className="h-3 w-3 mr-1" />
            Proposal Data
          </Badge>
        );
      case 'mock':
        return (
          <Badge variant="outline" className="bg-yellow-600 hover:bg-yellow-700">
            <Info className="h-3 w-3 mr-1" />
            Mock Data
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Data Source Indicator */}
      {getDataSourceBadge() && (
        <div className="absolute top-4 right-4 z-10">
          {getDataSourceBadge()}
        </div>
      )}
      
      <CoreSerpAnalysisPanel 
        {...props} 
        isLoading={isLoading}
      />
    </div>
  );
}