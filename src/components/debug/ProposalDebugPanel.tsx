import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Bug, ChevronDown, Copy, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ProposalDebugPanelProps {
  proposals: any[];
  onRefresh?: () => void;
  className?: string;
}

export const ProposalDebugPanel: React.FC<ProposalDebugPanelProps> = ({
  proposals,
  onRefresh,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const analyzeProposals = () => {
    const analysis = {
      total: proposals.length,
      withPrimaryKeyword: proposals.filter(p => p.primary_keyword).length,
      withTitle: proposals.filter(p => p.title).length,
      withDescription: proposals.filter(p => p.description).length,
      withRelatedKeywords: proposals.filter(p => p.related_keywords?.length > 0).length,
      withEstimatedImpressions: proposals.filter(p => p.estimated_impressions > 0).length,
      byPriority: {
        quick_win: proposals.filter(p => p.priority_tag === 'quick_win').length,
        high_return: proposals.filter(p => p.priority_tag === 'high_return').length,
        evergreen: proposals.filter(p => p.priority_tag === 'evergreen').length,
        undefined: proposals.filter(p => !p.priority_tag).length
      },
      dataQualityIssues: []
    };

    // Find data quality issues
    const issues: string[] = [];
    proposals.forEach((proposal, index) => {
      if (!proposal.primary_keyword) {
        issues.push(`Proposal ${index + 1}: Missing primary keyword`);
      }
      if (!proposal.title) {
        issues.push(`Proposal ${index + 1}: Missing title`);
      }
      if (!proposal.description) {
        issues.push(`Proposal ${index + 1}: Missing description`);
      }
      if (proposal.estimated_impressions < 0) {
        issues.push(`Proposal ${index + 1}: Negative estimated impressions`);
      }
    });

    analysis.dataQualityIssues = issues;
    return analysis;
  };

  const analysis = analyzeProposals();

  const copyAnalysisToClipboard = () => {
    const debugData = {
      timestamp: new Date().toISOString(),
      analysis,
      sampleProposals: proposals.slice(0, 3).map(p => ({
        title: p.title,
        primary_keyword: p.primary_keyword,
        priority_tag: p.priority_tag,
        estimated_impressions: p.estimated_impressions,
        hasRelatedKeywords: !!p.related_keywords?.length,
        hasDescription: !!p.description
      }))
    };

    navigator.clipboard.writeText(JSON.stringify(debugData, null, 2));
    toast.success('Debug data copied to clipboard');
  };

  const getHealthStatus = () => {
    const issues = analysis.dataQualityIssues.length;
    if (issues === 0) return { status: 'healthy', color: 'text-green-400', icon: CheckCircle };
    if (issues < 5) return { status: 'warning', color: 'text-yellow-400', icon: AlertTriangle };
    return { status: 'critical', color: 'text-red-400', icon: AlertTriangle };
  };

  const health = getHealthStatus();

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-black/80 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
          >
            <Bug className="w-4 h-4" />
            Debug Panel
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2 w-80 bg-black/90 border-white/20 text-white backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bug className="w-4 h-4" />
                Proposal Debug Info
                <div className="flex items-center gap-1 ml-auto">
                  <health.icon className={`w-4 h-4 ${health.color}`} />
                  <span className={`text-xs ${health.color}`}>
                    {health.status}
                  </span>
                </div>
              </CardTitle>
              <CardDescription className="text-white/60 text-xs">
                Development debugging panel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white/5 rounded">
                  <div className="text-white/60">Total</div>
                  <div className="font-bold">{analysis.total}</div>
                </div>
                <div className="p-2 bg-white/5 rounded">
                  <div className="text-white/60">With Keywords</div>
                  <div className="font-bold">{analysis.withPrimaryKeyword}</div>
                </div>
                <div className="p-2 bg-white/5 rounded">
                  <div className="text-white/60">With Titles</div>
                  <div className="font-bold">{analysis.withTitle}</div>
                </div>
                <div className="p-2 bg-white/5 rounded">
                  <div className="text-white/60">With Desc.</div>
                  <div className="font-bold">{analysis.withDescription}</div>
                </div>
              </div>

              {/* Priority Distribution */}
              <div>
                <div className="text-xs text-white/60 mb-2">Priority Distribution</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Quick Win</span>
                    <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-500/10">
                      {analysis.byPriority.quick_win}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>High Return</span>
                    <Badge variant="outline" className="text-blue-400 border-blue-400/30 bg-blue-500/10">
                      {analysis.byPriority.high_return}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Evergreen</span>
                    <Badge variant="outline" className="text-purple-400 border-purple-400/30 bg-purple-500/10">
                      {analysis.byPriority.evergreen}
                    </Badge>
                  </div>
                  {analysis.byPriority.undefined > 0 && (
                    <div className="flex justify-between text-xs">
                      <span>Undefined</span>
                      <Badge variant="outline" className="text-red-400 border-red-400/30 bg-red-500/10">
                        {analysis.byPriority.undefined}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Data Quality Issues */}
              {analysis.dataQualityIssues.length > 0 && (
                <div>
                  <div className="text-xs text-red-400 mb-2">
                    Data Quality Issues ({analysis.dataQualityIssues.length})
                  </div>
                  <div className="max-h-20 overflow-y-auto space-y-1">
                    {analysis.dataQualityIssues.slice(0, 5).map((issue, index) => (
                      <div key={index} className="text-xs text-red-300 p-1 bg-red-500/10 rounded">
                        {issue}
                      </div>
                    ))}
                    {analysis.dataQualityIssues.length > 5 && (
                      <div className="text-xs text-white/40">
                        ...and {analysis.dataQualityIssues.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAnalysisToClipboard}
                  className="flex-1 gap-1 text-xs border-white/20 bg-white/5 hover:bg-white/10 text-white"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </Button>
                {onRefresh && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    className="flex-1 gap-1 text-xs border-white/20 bg-white/5 hover:bg-white/10 text-white"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};