import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CampaignStrategySummary } from '@/types/campaign-types';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface StrategyComparisonModalProps {
  strategies: CampaignStrategySummary[];
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export function StrategyComparisonModal({
  strategies,
  open,
  onClose,
  onSelect
}: StrategyComparisonModalProps) {
  if (strategies.length < 2) return null;

  const effortLabels = {
    low: { text: 'Low', color: 'bg-green-500/20 text-green-600' },
    medium: { text: 'Medium', color: 'bg-yellow-500/20 text-yellow-600' },
    high: { text: 'High', color: 'bg-red-500/20 text-red-600' }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compare Strategies Side-by-Side</DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left font-semibold text-sm text-muted-foreground sticky left-0 bg-background">
                  Criteria
                </th>
                {strategies.map((strategy) => (
                  <th key={strategy.id} className="p-4 text-left min-w-[250px]">
                    <div className="space-y-2">
                      <div className="font-semibold text-foreground">{strategy.title}</div>
                      <button
                        onClick={() => {
                          onSelect(strategy.id);
                          onClose();
                        }}
                        className="text-xs px-3 py-1 rounded-full bg-primary text-primary-foreground hover:opacity-90"
                      >
                        Select This
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="p-4 font-medium text-sm sticky left-0 bg-background">Effort Level</td>
                {strategies.map((strategy) => (
                  <td key={strategy.id} className="p-4">
                    <Badge className={effortLabels[strategy.effortLevel].color}>
                      {effortLabels[strategy.effortLevel].text}
                    </Badge>
                  </td>
                ))}
              </tr>

              <tr className="border-b border-border/50">
                <td className="p-4 font-medium text-sm sticky left-0 bg-background">Total Hours</td>
                {strategies.map((strategy) => (
                  <td key={strategy.id} className="p-4 text-foreground">
                    {(strategy as any).totalHours || 'N/A'} hours
                  </td>
                ))}
              </tr>

              <tr className="border-b border-border/50">
                <td className="p-4 font-medium text-sm sticky left-0 bg-background">Expected Outcome</td>
                {strategies.map((strategy) => (
                  <td key={strategy.id} className="p-4 text-sm text-muted-foreground">
                    {strategy.expectedOutcome}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-border/50">
                <td className="p-4 font-medium text-sm sticky left-0 bg-background">Content Pieces</td>
                {strategies.map((strategy) => (
                  <td key={strategy.id} className="p-4 text-foreground">
                    {strategy.contentMix.reduce((sum, item) => sum + item.count, 0)} pieces
                  </td>
                ))}
              </tr>

              <tr className="border-b border-border/50">
                <td className="p-4 font-medium text-sm sticky left-0 bg-background">Focus</td>
                {strategies.map((strategy) => (
                  <td key={strategy.id} className="p-4">
                    <Badge variant="outline" className="capitalize">
                      {strategy.focus}
                    </Badge>
                  </td>
                ))}
              </tr>

              <tr className="border-b border-border/50">
                <td className="p-4 font-medium text-sm sticky left-0 bg-background">Complexity</td>
                {strategies.map((strategy) => (
                  <td key={strategy.id} className="p-4 text-foreground capitalize">
                    {(strategy as any).complexity || 'Medium'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
