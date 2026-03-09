
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Lightbulb, Save, TrendingUp, Loader2, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { StrategyWorkflowActions } from '../StrategyWorkflowActions';
import { toast } from 'sonner';
import { sendChatRequest } from '@/services/aiService/aiService';
import { useContentGaps, useClusters } from '@/hooks/useResearchIntelligence';
import { supabase } from '@/integrations/supabase/client';

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
  const { data: savedGaps, isLoading: loadingGaps, create: createGap } = useContentGaps();
  const { data: clusters } = useClusters();
  const [keyword, setKeyword] = useState(goals.mainKeyword || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [selectedGaps, setSelectedGaps] = useState<string[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<string>('');

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
      
      const ai = await generateGapsFromAi(serpData);
      setGapAnalysis({ keyword, gaps: ai.gaps, serpData, opportunityScore: ai.opportunityScore });
      
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

  const handleSaveSelectedGaps = async () => {
    if (selectedGaps.length === 0) {
      toast.error('Select at least one gap to save');
      return;
    }

    setIsSaving(true);
    try {
      const baseScore = gapAnalysis?.opportunityScore ?? 50;
      const savedResults = await Promise.all(
        selectedGaps.map((gap, i) =>
          createGap({
            title: gap,
            gap_type: 'content',
            opportunity_score: Math.max(0, Math.min(100, baseScore - i * 3)),
            keywords: keyword ? [keyword] : [],
            status: 'identified',
            target_cluster_id: selectedClusterId || null,
          })
        )
      );
      toast.success(`${selectedGaps.length} gap(s) saved to database`);
      setSelectedGaps([]);

      // Auto-generate strategy recommendations
      const gapIds = savedResults.map(r => r.id).filter(Boolean);
      if (gapIds.length > 0) {
        toast.info('Generating strategy recommendations...');
        supabase.functions.invoke('generate-strategy-recommendations', {
          body: JSON.stringify({ gap_ids: gapIds }),
        }).then(({ error }) => {
          if (error) {
            console.error('Recommendation generation failed:', error);
          } else {
            toast.success('Strategy recommendations generated');
          }
        });
      }
    } catch (error) {
      toast.error('Failed to save gaps');
    } finally {
      setIsSaving(false);
    }
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
                          onCheckedChange={() => toggleGapSelection(gap)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-400" />
                            <span className="font-medium">{gap}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={() => setSelectedGaps(gapAnalysis.gaps)} variant="outline" size="sm">Select All</Button>
                <Button onClick={() => setSelectedGaps([])} variant="outline" size="sm">Clear Selection</Button>

                {selectedGaps.length > 0 && clusters && clusters.length > 0 && (
                  <Select value={selectedClusterId} onValueChange={setSelectedClusterId}>
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                      <SelectValue placeholder="Link to cluster…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No cluster</SelectItem>
                      {clusters.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.cluster_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {selectedGaps.length > 0 && (
                  <Button
                    onClick={handleSaveSelectedGaps}
                    disabled={isSaving}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 ml-auto"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                    Save {selectedGaps.length} Gap{selectedGaps.length > 1 ? 's' : ''}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Gaps from DB */}
      {!loadingGaps && savedGaps && savedGaps.length > 0 && (
        <Card className="bg-background/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-primary" />
              Saved Content Gaps ({savedGaps.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {savedGaps.map((gap) => (
                <div
                  key={gap.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/40 border border-border/30"
                >
                  <div className="flex items-center gap-3">
                    <Lightbulb className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{gap.title}</span>
                    {gap.keywords && (gap.keywords as string[]).length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {(gap.keywords as string[])[0]}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {gap.opportunity_score != null && (
                      <Badge variant="secondary" className="text-xs">
                        {gap.opportunity_score}%
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs capitalize">
                      {gap.status ?? 'identified'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedGaps.length > 0 && (
        <StrategyWorkflowActions 
          selectedKeywords={[keyword]}
          contentGaps={selectedGaps}
        />
      )}
    </div>
  );
};
