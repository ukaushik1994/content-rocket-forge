import React from 'react';
import { PanelShell } from './PanelShell';
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { Button } from '@/components/ui/button';
import { BarChart3, ExternalLink, RefreshCcw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AnalyticsPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { metrics, loading, refreshAnalytics } = useAnalyticsData();

  return (
    <PanelShell isOpen={isOpen} onClose={onClose} title="Analytics" icon={<BarChart3 className="h-4 w-4" />}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refreshAnalytics()}
          disabled={loading}
          className="text-muted-foreground"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <RefreshCcw className="h-3.5 w-3.5 mr-1" />}
          Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { onClose(); navigate('/analytics'); }}
          className="text-xs"
        >
          Full Dashboard <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </div>
      <AnalyticsOverview />
    </PanelShell>
  );
};
