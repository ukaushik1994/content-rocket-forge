
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
import { sendChatRequest } from '@/services/aiService/aiService';

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
      if (!serpData) {
        throw new Error('No SERP data available');
      }
      
      // Generate content gaps using AI based on SERP analysis
      const ai = await generateGapsFromAi(serpData);
      setGapAnalysis({ keyword, gaps: ai.gaps, serpData, opportunityScore: ai.opportunityScore });
      
      // Save the insight
      await saveInsight({
        keyword,
        serp_data: serpData,
        content_gaps: ai.gaps,
        opportunity_score: ai.opportunityScore ?? undefined,
        last_analyzed: new Date().toISOString()
      });
      
      toast.success('Content gap analysis completed');
    } catch (error) {
      toast.error('Failed to analyze content gaps');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateGapsFromAi = async (serpData: any): Promise<{ gaps: string[]; opportunityScore?: number }> => {
    const resp = await sendChatRequest('openai', {
      messages: [
        { role: 'system', content: 'You are an SEO strategist. Return pure JSON only in the format {"gaps": string[], "opportunity_score": number}.' },
        { role: 'user', content: `Keyword: ${keyword}\nSummarized SERP data: ${JSON.stringify({ topResults: serpData?.topResults?.slice(0,5), peopleAlsoAsk: serpData?.peopleAlsoAsk?.slice(0,5), relatedSearches: serpData?.relatedSearches?.slice(0,8), entities: serpData?.entities?.slice(0,10) })}\nGenerate 6 concise gap ideas users actually search for.` }
      ],
      temperature: 0.2,
      maxTokens: 800
    });
    const content = resp?.choices?.[0]?.message?.content || '{}';
    try {
      const parsed = JSON.parse(content);
      return { gaps: parsed.gaps || [], opportunityScore: parsed.opportunity_score };
    } catch {
      return { gaps: [], opportunityScore: undefined };
    }
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
      <Card className="bg-background/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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
              className="flex-1 bg-background/80 border-border/50"
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyzeGaps()}
            />
            <Button
              onClick={handleAnalyzeGaps}
              disabled={isAnalyzing}
              className="bg-primary hover:bg-primary/90"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>

          {gapAnalysis && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Content Opportunities for "{gapAnalysis.keyword}"
                </h3>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  Opportunity Score: {gapAnalysis.opportunityScore != null ? `${Math.round(gapAnalysis.opportunityScore)}%` : '—'}
                </Badge>
              </div>

              <div className="grid gap-3">
                {gapAnalysis.gaps.map((gap: string, index: number) => (
                  <Card 
                    key={index} 
                    className="bg-background/40 border-border/50 cursor-pointer transition-colors hover:border-primary/50"
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
                            <span className="font-medium">{gap}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
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
                >
                  Select All
                </Button>
                <Button
                  onClick={() => setSelectedGaps([])}
                  variant="outline" 
                  size="sm"
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
