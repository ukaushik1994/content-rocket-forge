import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitCompare, X, TrendingUp, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface VersionComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  version1: any;
  version2: any;
}

export const VersionComparisonModal: React.FC<VersionComparisonModalProps> = ({
  isOpen,
  onClose,
  version1,
  version2
}) => {
  if (!version1 || !version2) return null;

  const v1Charts = Array.isArray(version1.charts_data) ? version1.charts_data.length : 0;
  const v2Charts = Array.isArray(version2.charts_data) ? version2.charts_data.length : 0;
  
  const v1Insights = Array.isArray(version1.insights) ? version1.insights.length : 0;
  const v2Insights = Array.isArray(version2.insights) ? version2.insights.length : 0;

  const v1Items = Array.isArray(version1.actionable_items) ? version1.actionable_items.length : 0;
  const v2Items = Array.isArray(version2.actionable_items) ? version2.actionable_items.length : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <GitCompare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Version Comparison</h2>
                <p className="text-sm text-muted-foreground">
                  Comparing changes between versions
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 px-6 py-6">
          <div className="space-y-6">
            {/* Version Headers */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">Version {version1.version_number}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(version1.created_at), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                <p className="text-sm font-medium">{version1.title}</p>
              </Card>

              <Card className="p-4 bg-primary/5">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="default">Version {version2.version_number}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(version2.created_at), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                <p className="text-sm font-medium">{version2.title}</p>
              </Card>
            </div>

            {/* Statistics Comparison */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Statistics</h3>
              <div className="space-y-4">
                {/* Charts */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Charts</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{v1Charts}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{v2Charts}</span>
                    {v2Charts > v1Charts && (
                      <Badge variant="default" className="text-xs bg-success/10 text-success">
                        +{v2Charts - v1Charts}
                      </Badge>
                    )}
                    {v2Charts < v1Charts && (
                      <Badge variant="secondary" className="text-xs bg-destructive/10 text-destructive">
                        {v2Charts - v1Charts}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Insights */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Insights</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{v1Insights}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{v2Insights}</span>
                    {v2Insights > v1Insights && (
                      <Badge variant="default" className="text-xs bg-success/10 text-success">
                        +{v2Insights - v1Insights}
                      </Badge>
                    )}
                    {v2Insights < v1Insights && (
                      <Badge variant="secondary" className="text-xs bg-destructive/10 text-destructive">
                        {v2Insights - v1Insights}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Items */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Action Items</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{v1Items}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{v2Items}</span>
                    {v2Items > v1Items && (
                      <Badge variant="default" className="text-xs bg-success/10 text-success">
                        +{v2Items - v1Items}
                      </Badge>
                    )}
                    {v2Items < v1Items && (
                      <Badge variant="secondary" className="text-xs bg-destructive/10 text-destructive">
                        {v2Items - v1Items}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Key Changes Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Key Changes
              </h3>
              <div className="space-y-3">
                {v2Charts !== v1Charts && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm">
                      Chart count changed from {v1Charts} to {v2Charts}
                      {v2Charts > v1Charts ? ' (added charts)' : ' (removed charts)'}
                    </p>
                  </div>
                )}
                {v2Insights !== v1Insights && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm">
                      Insights updated: {v1Insights} → {v2Insights}
                      {v2Insights > v1Insights ? ' (new insights added)' : ' (insights refined)'}
                    </p>
                  </div>
                )}
                {version2.change_summary && (
                  <div className="p-3 rounded-lg bg-primary/5">
                    <p className="text-sm font-medium mb-1">Change Summary:</p>
                    <p className="text-sm text-muted-foreground">{version2.change_summary}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-muted/30">
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
