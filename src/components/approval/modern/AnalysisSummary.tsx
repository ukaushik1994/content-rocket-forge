import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Target, Search, Eye, Star, RefreshCw, Sparkles } from 'lucide-react';
import { useContentAnalysis } from '@/hooks/useContentAnalysis';
import { ContentItemType } from '@/contexts/content/types';

interface AnalysisSummaryProps {
  content: ContentItemType;
}

export const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({ content }) => {
  const { data, loading, analyzeOnce, reanalyze } = useContentAnalysis(content.id);

  const hasResult = !!data?.analysis;
  const overall = (data?.analysis?.overallScore as number | undefined) ?? (data?.seo_score as number | undefined);
  const scores = data?.analysis?.scores as { seo: number; readability: number; quality: number } | undefined;
  const lastAnalyzed = data?.analyzed_at ? new Date(data.analyzed_at).toLocaleString() : null;

  return (
    <Card className="bg-background/60 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Analysis Summary
          </CardTitle>
          {overall !== undefined && (
            <Badge variant="secondary" className="text-xs">
              {overall}%
            </Badge>
          )}
        </div>
        {lastAnalyzed && (
          <p className="text-xs text-muted-foreground">Last analyzed: {lastAnalyzed}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Analyzing...</span>
          </div>
        )}

        {hasResult ? (
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-md bg-card/50 border border-border/50">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Search className="h-3 w-3" /> SEO
              </div>
              <div className="text-sm font-semibold">{scores?.seo ?? '—'}%</div>
            </div>
            <div className="p-2 rounded-md bg-card/50 border border-border/50">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Eye className="h-3 w-3" /> Readability
              </div>
              <div className="text-sm font-semibold">{scores?.readability ?? '—'}%</div>
            </div>
            <div className="p-2 rounded-md bg-card/50 border border-border/50">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Star className="h-3 w-3" /> Quality
              </div>
              <div className="text-sm font-semibold">{scores?.quality ?? '—'}%</div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">No analysis yet. Run an analysis to see insights.</div>
        )}

        <div className="flex gap-2">
          {hasResult ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={loading}
              onClick={async () => { await reanalyze(content); }}
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Reanalyze
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1"
              disabled={loading}
              onClick={async () => { await analyzeOnce(content); }}
            >
              <Target className="h-4 w-4 mr-2" /> Analyze
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
