import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BarChart3, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SerpTilesOverview } from '@/components/content-builder/serp/SerpTilesOverview';
import { SerpTilesLoading } from '@/components/content-builder/serp/SerpTilesLoading';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { SerpAnalysisResult } from '@/types/serp';
import { toast } from 'sonner';

interface KeywordSerpTabProps {
  searchTerm: string;
  onDataUpdate?: (data: any) => void;
}

export const KeywordSerpTab: React.FC<KeywordSerpTabProps> = ({ 
  searchTerm, 
  onDataUpdate 
}) => {
  const [serpData, setSerpData] = useState<SerpAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeKeyword = async (keyword: string) => {
    if (!keyword.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      toast.info(`Analyzing SERP data for "${keyword}"`);
      
      const result = await analyzeKeywordSerp(keyword);
      
      if (result) {
        setSerpData(result);
        onDataUpdate?.(result);
        toast.success('SERP analysis completed');
      } else {
        throw new Error('No SERP data received');
      }
    } catch (error) {
      const errorMessage = 'Failed to analyze keyword. Using mock data for demonstration.';
      console.error('SERP Analysis Error:', error);
      setError(errorMessage);
      
      // Generate mock SERP data for demonstration
      const mockData: SerpAnalysisResult = {
        keyword,
        searchVolume: Math.floor(Math.random() * 10000) + 1000,
        keywordDifficulty: Math.floor(Math.random() * 100),
        competitionScore: Math.random(),
        topResults: [
          {
            title: `Top result for ${keyword}`,
            link: 'https://example.com',
            snippet: `Comprehensive guide about ${keyword} with detailed information...`,
            position: 1
          },
          {
            title: `Best practices for ${keyword}`,
            link: 'https://example2.com',
            snippet: `Learn the best practices and strategies for ${keyword}...`,
            position: 2
          }
        ],
        peopleAlsoAsk: [
          { question: `What is ${keyword}?`, source: 'Google' },
          { question: `How to use ${keyword}?`, source: 'Google' },
          { question: `Best ${keyword} practices?`, source: 'Google' }
        ],
        relatedSearches: [
          { query: `${keyword} guide` },
          { query: `${keyword} tips` },
          { query: `best ${keyword}` }
        ],
        entities: [
          { name: keyword.charAt(0).toUpperCase() + keyword.slice(1), type: 'Topic' },
          { name: 'Best Practices', type: 'Concept' },
          { name: 'Guide', type: 'Content Type' }
        ],
        headings: [
          { text: `Understanding ${keyword}`, level: 'h2' },
          { text: `${keyword} Best Practices`, level: 'h2' },
          { text: `Getting Started with ${keyword}`, level: 'h3' }
        ],
        contentGaps: [
          { 
            topic: `Advanced ${keyword} techniques`,
            description: 'Competitors lack in-depth technical coverage',
            recommendation: 'Create comprehensive technical guide',
            content: `Create detailed advanced guide for ${keyword} with technical strategies`,
            source: 'SERP Analysis'
          },
          {
            topic: `${keyword} for beginners`,
            description: 'Missing beginner-friendly content',
            recommendation: 'Develop step-by-step tutorial',
            content: `Develop beginner-friendly tutorial series for ${keyword}`,
            source: 'SERP Analysis'
          }
        ],
        featuredSnippets: [
          {
            type: 'paragraph',
            content: `${keyword} is a crucial aspect of modern digital strategy...`,
            source: 'example.com',
            title: `What is ${keyword}?`
          }
        ],
        isMockData: true
      };
      
      setSerpData(mockData);
      onDataUpdate?.(mockData);
      toast.warning(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToContent = (content: string, type: string) => {
    toast.success(`Added ${type} to content selections`);
    console.log('Added to content:', { content, type });
  };

  const handleRetry = () => {
    handleAnalyzeKeyword(searchTerm);
  };

  // Auto-analyze when searchTerm changes
  useEffect(() => {
    if (searchTerm && searchTerm.trim()) {
      handleAnalyzeKeyword(searchTerm);
    }
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* SERP Analysis Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel bg-background/60 backdrop-blur-xl border-border/50 rounded-xl p-6"
      >
        {isLoading ? (
          <SerpTilesLoading mainKeyword={searchTerm} />
        ) : serpData ? (
          <SerpTilesOverview
            serpData={serpData}
            mainKeyword={searchTerm}
            onSectionClick={(sectionId) => {
              console.log('Section clicked:', sectionId);
              // TODO: Open detailed view modal or navigate to section
            }}
            onAddToContent={handleAddToContent}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No SERP data available</p>
            <Button onClick={handleRetry} className="mt-4">
              Try Again
            </Button>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      {serpData && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-4 bg-background/60 backdrop-blur-xl border-border/50"
        >
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              Analysis completed • {serpData.isMockData ? 'Demo data' : 'Live data'}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="border-border/50 text-foreground hover:bg-background/60"
              >
                <Search className="h-4 w-4 mr-2" />
                Refresh Analysis
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};