import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SerpSectionCard } from './sections/SerpSectionCard';
import { analyzeKeywordEnhanced, EnhancedSerpResult, getSerpSection } from '@/services/enhancedSerpService';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { 
  Search, 
  MessageSquare, 
  FileText, 
  Star, 
  TrendingUp, 
  Image, 
  Users, 
  List, 
  Database,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedSerpAnalysisProps {
  keyword: string;
  onDataUpdate?: (data: EnhancedSerpResult) => void;
  proposalData?: any;
}

export const EnhancedSerpAnalysis: React.FC<EnhancedSerpAnalysisProps> = ({
  keyword,
  onDataUpdate,
  proposalData
}) => {
  const { state, dispatch } = useContentBuilder();
  const [data, setData] = useState<EnhancedSerpResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['keywords', 'questions']));

  // Get selected count from context
  const selectedCount = state.serpSelections.filter(item => item.selected).length;

  console.log('🔍 EnhancedSerpAnalysis init:', {
    keyword,
    hasProposalData: !!proposalData,
    proposalDataKeys: proposalData ? Object.keys(proposalData) : 'none'
  });

  const sectionConfigs = [
    {
      key: 'keywords',
      title: 'Keywords',
      description: 'Related keywords and search terms',
      icon: <Search className="h-5 w-5" />,
      provider: 'SerpAPI'
    },
    {
      key: 'contentGaps',
      title: 'Content Gaps',
      description: 'Opportunities competitors are missing',
      icon: <Star className="h-5 w-5" />,
      provider: 'SerpAPI'
    },
    {
      key: 'questions',
      title: 'Questions',
      description: 'People also ask questions',
      icon: <MessageSquare className="h-5 w-5" />,
      provider: 'SerpAPI'
    },
    {
      key: 'featuredSnippets',
      title: 'Featured Snippets',
      description: 'Snippet optimization opportunities',
      icon: <FileText className="h-5 w-5" />,
      provider: 'SerpAPI'
    },
    {
      key: 'topStories',
      title: 'Top Stories',
      description: 'Recent news and trending content',
      icon: <TrendingUp className="h-5 w-5" />,
      provider: 'SerpAPI'
    },
    {
      key: 'multimedia',
      title: 'Multimedia',
      description: 'Image and video opportunities',
      icon: <Image className="h-5 w-5" />,
      provider: 'SerpAPI'
    },
    {
      key: 'entities',
      title: 'Entities',
      description: 'Key entities and concepts',
      icon: <Users className="h-5 w-5" />,
      provider: 'SerpAPI'
    },
    {
      key: 'headings',
      title: 'Headings',
      description: 'Suggested content headings',
      icon: <List className="h-5 w-5" />,
      provider: 'SerpAPI'
    },
    {
      key: 'knowledgeGraph',
      title: 'Knowledge Graph',
      description: 'Entity information and related topics',
      icon: <Database className="h-5 w-5" />,
      provider: 'SerpAPI'
    }
  ];

  useEffect(() => {
    if (keyword) {
      // Check if we have proposal data first
      if (proposalData && !data) {
        console.log('📥 Using proposal data instead of API call...');
        loadProposalData();
      } else {
        fetchData();
      }
    }
  }, [keyword, proposalData]);

  const loadProposalData = () => {
    try {
      const targetKeyword = keyword;
      let serpDataEntry = proposalData[targetKeyword] || Object.values(proposalData)[0];
      
      if (serpDataEntry) {
        console.log('🔄 Converting proposal SERP data for display...');
        // Convert to EnhancedSerpResult format
        const convertedData: EnhancedSerpResult = {
          keyword: serpDataEntry.keyword || targetKeyword,
          searchVolume: serpDataEntry.searchVolume || 1000,
          keywordDifficulty: serpDataEntry.keywordDifficulty || 50,
          competitionScore: serpDataEntry.competitionScore || 0.5,
          keywords: serpDataEntry.keywords || [],
          contentGaps: serpDataEntry.contentGaps || [],
          questions: (serpDataEntry.peopleAlsoAsk || []).map(q => ({
            question: typeof q === 'string' ? q : q.question,
            source: typeof q === 'object' ? q.source || 'proposal' : 'proposal',
            answer: typeof q === 'object' ? q.answer : undefined
          })),
          featuredSnippets: serpDataEntry.featuredSnippets || [],
          topStories: serpDataEntry.topStories || [],
          multimedia: serpDataEntry.multimedia || { images: [], videos: [] },
          entities: serpDataEntry.entities || [],
          headings: (serpDataEntry.headings || []).map(h => ({
            text: typeof h === 'string' ? h : h.text,
            level: (typeof h === 'object' ? h.level : 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
            source: 'proposal',
            subtext: typeof h === 'object' ? h.subtext : ''
          })),
          knowledgeGraph: serpDataEntry.knowledgeGraph || { 
            title: '', 
            type: '', 
            description: '', 
            attributes: {}, 
            relatedEntities: [] 
          },
          metrics: {
            search_volume: serpDataEntry.searchVolume || 1000,
            seo_difficulty: serpDataEntry.keywordDifficulty || 50,
            opportunity_score: 75,
            competition_pct: serpDataEntry.competitionScore || 0.5,
            result_count: serpDataEntry.totalResults || 100000
          },
          serp_blocks: {
            organic: (serpDataEntry.topResults || []).map((result, index) => ({
              title: result.title || '',
              link: result.link || '',
              snippet: result.snippet || ''
            })),
            ads: [],
            people_also_ask: (serpDataEntry.peopleAlsoAsk || []).map(q => ({
              question: typeof q === 'string' ? q : q.question,
              answer: typeof q === 'object' ? q.answer : undefined
            })),
            images: [],
            videos: []
          },
          insights: serpDataEntry.insights || [`High-value content opportunities identified for "${targetKeyword}"`],
          data_sources: {
            is_cached: true,
            volume_api: false,
            serp_api: false
          },
          related_keywords: (serpDataEntry.keywords || []).map((kw, index) => ({
            title: typeof kw === 'string' ? kw : kw.keyword || kw.title,
            volume: typeof kw === 'object' ? kw.volume : undefined
          })),
          dataQuality: 'proposal',
          recommendations: serpDataEntry.recommendations || [`Leverage the identified entities and topics for comprehensive coverage of "${targetKeyword}"`],
          isMockData: serpDataEntry.isMockData !== false
        };

        console.log('✅ Proposal data converted successfully');
        setData(convertedData);
        onDataUpdate?.(convertedData);

        // Add selections to context
        addSelectionsFromData(convertedData);
        
        toast.success('SERP data loaded from proposal');
      }
    } catch (error) {
      console.error('❌ Error loading proposal data:', error);
      toast.error('Failed to load proposal SERP data');
    }
  };

  const addSelectionsFromData = (serpData: EnhancedSerpResult) => {
    try {
      // Add keywords
      serpData.keywords.forEach(keyword => {
        dispatch({
          type: 'ADD_SERP_SELECTION',
          payload: {
            type: 'keyword',
            content: keyword,
            selected: false,
            source: 'proposal_data'
          }
        });
      });

      // Add entities
      serpData.entities.forEach(entity => {
        dispatch({
          type: 'ADD_SERP_SELECTION',
          payload: {
            type: 'entity',
            content: entity.name,
            selected: false,
            source: 'proposal_data',
            metadata: entity
          }
        });
      });

      // Add questions
      serpData.questions.forEach(q => {
        dispatch({
          type: 'ADD_SERP_SELECTION',
          payload: {
            type: 'question',
            content: q.question,
            selected: false,
            source: 'proposal_data'
          }
        });
      });

      console.log('📋 Added selections from proposal data');
    } catch (error) {
      console.error('❌ Error adding selections from proposal data:', error);
    }
  };

  const fetchData = async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      const result = await analyzeKeywordEnhanced(keyword, 'us', forceRefresh);
      if (result) {
        console.log('📊 Enhanced SERP result received:', result);
        setData(result);
        onDataUpdate?.(result);
        
        // Add all available selections to context using the transformer
        try {
          const { transformSerpData, extractAllSelections } = await import('@/services/serpDataTransformer');
          const normalizedData = transformSerpData(result);
          const allSelections = extractAllSelections(normalizedData);
          
          console.log(`📋 Adding ${allSelections.length} selections to context`);
          allSelections.forEach(selection => {
            dispatch({
              type: 'ADD_SERP_SELECTION',
              payload: selection
            });
          });
        } catch (transformError) {
          console.warn('Failed to transform SERP data, adding basic selections:', transformError);
          // Fallback: add basic keywords and questions manually
          if (result.keywords) {
            result.keywords.forEach(keyword => {
              dispatch({
                type: 'ADD_SERP_SELECTION',
                payload: {
                  type: 'keyword',
                  content: keyword,
                  selected: false,
                  source: 'enhanced_serp'
                }
              });
            });
          }
        }
        
        toast.success('SERP analysis completed successfully');
      }
    } catch (error: any) {
      console.error('Error fetching SERP data:', error);
      
      // Handle specific error messages
      if (error.message?.includes('API key not configured')) {
        toast.error('SERP API key not configured. Please add your SerpAPI key in the settings.');
      } else if (error.message?.includes('Invalid API key')) {
        toast.error('Invalid SERP API key. Please check your API key configuration.');
      } else if (error.message?.includes('quota')) {
        toast.error('SERP API quota exceeded. Please check your API usage or upgrade your plan.');
      } else if (error.message?.includes('SERP API error')) {
        toast.error(error.message);
      } else {
        toast.error('Failed to analyze keyword. Please try again or check your API configuration.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  const selectItem = (sectionKey: string, item: any) => {
    console.log('📌 Selecting item:', { sectionKey, item });
    // Use the context dispatch to handle selection
    dispatch({
      type: 'TOGGLE_SERP_SELECTION',
      payload: { type: item.type || sectionKey, content: item.content }
    });
  };

  const selectAllInSection = (sectionKey: string, items: any[]) => {
    console.log('📌 Selecting all items in section:', sectionKey, items.length);
    // Use the context dispatch for all items
    items.forEach(item => {
      dispatch({
        type: 'TOGGLE_SERP_SELECTION',
        payload: { type: item.type || sectionKey, content: item.content }
      });
    });
  };

  const generateContent = () => {
    if (selectedCount === 0) {
      toast.error('Please select at least one item to generate content');
      return;
    }
    
    // Mark step as completed and move to outline
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
    
    toast.success(`Generated outline with ${selectedCount} selected SERP items`);
  };

  // Helper function to check if an item is selected
  const isItemSelected = (sectionKey: string, item: any): boolean => {
    const itemType = item.type || sectionKey;
    return state.serpSelections.some(
      selection => selection.type === itemType && 
                   selection.content === item.content && 
                   selection.selected
    );
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-neon-purple" />
          <p className="text-lg font-medium">Analyzing keyword with enhanced SERP data...</p>
          <p className="text-sm text-muted-foreground">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">No SERP data available</p>
            <p className="text-sm text-muted-foreground mb-4">
              Make sure your SERP API key is configured correctly
            </p>
            <Button onClick={() => fetchData()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Enhanced SERP Analysis</CardTitle>
              <CardDescription>
                Comprehensive analysis for: <span className="font-medium">{keyword}</span>
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={data.isMockData ? 'secondary' : 'default'} className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>{data.isMockData ? 'Mock Data' : 'Live Data'}</span>
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchData(true)}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-neon-purple">{data.searchVolume.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Monthly Searches</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-neon-blue">{data.keywordDifficulty}</p>
              <p className="text-sm text-muted-foreground">SEO Difficulty</p>
              <Progress value={data.keywordDifficulty} className="mt-1" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{selectedCount}</p>
              <p className="text-sm text-muted-foreground">Items Selected</p>
            </div>
          </div>
          
          {selectedCount > 0 && (
            <div className="flex justify-center">
              <Button onClick={generateContent} className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Generate Content from {selectedCount} Selected Items</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SERP Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sectionConfigs.map(config => {
          const sectionData = getSerpSection(data, config.key);
          const itemsWithSelection = sectionData.map(item => ({
            ...item,
            selected: isItemSelected(config.key, item)
          }));
          
          return (
            <SerpSectionCard
              key={config.key}
              title={config.title}
              description={config.description}
              count={sectionData.length}
              provider={config.provider}
              items={itemsWithSelection}
              isExpanded={expandedSections.has(config.key)}
              onToggleExpand={() => toggleSection(config.key)}
              onSelectItem={(item) => selectItem(config.key, item)}
              onSelectAll={() => selectAllInSection(config.key, sectionData)}
              icon={config.icon}
            />
          );
        })}
      </div>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Strategic Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-neon-purple rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
