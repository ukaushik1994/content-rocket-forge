
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Lightbulb, Plus, TrendingUp } from 'lucide-react';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { StrategyWorkflowActions } from '../StrategyWorkflowActions';
import { toast } from 'sonner';

interface ContentGapsTabProps {
  serpMetrics?: any;
  goals: {
    monthlyTraffic: string;
    contentPieces: string;
    timeline: string;
    mainKeyword: string;
  };
}

export const ContentGapsTab: React.FC<ContentGapsTabProps> = ({ serpMetrics, goals }) => {
  const { analyzeSERP, saveInsight } = useContentStrategy();
  const [keyword, setKeyword] = useState(goals.mainKeyword || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [selectedGaps, setSelectedGaps] = useState<string[]>([]);

  const handleAnalyzeGaps = async () => {
    if (!keyword.trim()) {
      toast.error('Please enter a keyword to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const serpData = await analyzeSERP(keyword);
      
      // Generate content gaps based on SERP analysis
      const gaps = generateContentGaps(serpData);
      setGapAnalysis({ keyword, gaps, serpData });
      
      // Save the insight
      await saveInsight({
        keyword,
        serp_data: serpData,
        content_gaps: gaps,
        opportunity_score: calculateOpportunityScore(gaps),
        last_analyzed: new Date().toISOString()
      });
      
      toast.success('Content gap analysis completed');
    } catch (error) {
      toast.error('Failed to analyze content gaps');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateContentGaps = (serpData: any) => {
    // Mock implementation - in real app would use AI/analysis
    const baseGaps = [
      `How to optimize ${keyword} for beginners`,
      `Advanced ${keyword} strategies`,
      `${keyword} vs alternatives comparison`,
      `Common ${keyword} mistakes to avoid`,
      `${keyword} best practices 2024`,
      `Case studies using ${keyword}`,
      `${keyword} tools and resources`,
      `${keyword} ROI measurement`
    ];

    // Add dynamic gaps based on SERP data
    if (serpData?.topResults) {
      baseGaps.push(`What ${serpData.topResults.length} top sites miss about ${keyword}`);
    }

    return baseGaps.slice(0, 6);
  };

  const calculateOpportunityScore = (gaps: string[]) => {
    return Math.floor(Math.random() * 40) + 60; // Mock score 60-100
  };

  const toggleGapSelection = (gap: string) => {
    setSelectedGaps(prev => 
      prev.includes(gap) 
        ? prev.filter(g => g !== gap)
        : [...prev, gap]
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="h-5 w-5" />
            Content Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter keyword to analyze gaps..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyzeGaps()}
            />
            <Button
              onClick={handleAnalyzeGaps}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>

          {gapAnalysis && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Content Opportunities for "{gapAnalysis.keyword}"
                </h3>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  Opportunity Score: {calculateOpportunityScore(gapAnalysis.gaps)}%
                </Badge>
              </div>

              <div className="grid gap-3">
                {gapAnalysis.gaps.map((gap: string, index: number) => (
                  <Card 
                    key={index} 
                    className="bg-white/5 border-white/10 cursor-pointer transition-colors hover:bg-white/10"
                    onClick={() => toggleGapSelection(gap)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedGaps.includes(gap)}
                          onChange={() => toggleGapSelection(gap)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-400" />
                            <span className="text-white font-medium">{gap}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline" className="text-xs">
                              Est. Traffic: {Math.floor(Math.random() * 5000) + 500}/month
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Difficulty: {Math.floor(Math.random() * 50) + 20}/100
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setSelectedGaps(gapAnalysis.gaps)}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Select All
                </Button>
                <Button
                  onClick={() => setSelectedGaps([])}
                  variant="outline" 
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedGaps.length > 0 && (
        <StrategyWorkflowActions 
          selectedKeywords={[keyword]}
          contentGaps={selectedGaps}
        />
      )}
    </div>
  );
};
