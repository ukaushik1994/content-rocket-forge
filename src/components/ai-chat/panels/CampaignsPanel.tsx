import React, { useState } from 'react';
import { PanelShell } from './PanelShell';
import { CampaignList } from '@/components/campaigns/CampaignList';
import { CampaignBreakdownView } from '@/components/campaigns/CampaignBreakdownView';
import { useCampaigns } from '@/hooks/useCampaigns';
import { ContentGenerationProvider } from '@/contexts/ContentGenerationContext';
import { SavedCampaign } from '@/services/campaignService';
import { CampaignGoal, CampaignTimeline } from '@/types/campaign-types';
import { Megaphone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CampaignsPanelInner: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { campaigns, isLoading, deleteCampaign, updateCampaignName, updateCampaignStatus } = useCampaigns();
  const [viewingCampaign, setViewingCampaign] = useState<SavedCampaign | null>(null);

  if (viewingCampaign) {
    return (
      <PanelShell isOpen={isOpen} onClose={onClose} title={viewingCampaign.name} icon={<Megaphone className="h-4 w-4" />}>
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => setViewingCampaign(null)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to list
          </Button>
        </div>
        <CampaignBreakdownView
          strategy={viewingCampaign.selected_strategy}
          campaignInput={{
            idea: viewingCampaign.original_idea,
            goal: (viewingCampaign.goal as CampaignGoal) || undefined,
            targetAudience: viewingCampaign.target_audience || '',
            timeline: (viewingCampaign.timeline as CampaignTimeline) || undefined,
          }}
        />
      </PanelShell>
    );
  }

  return (
    <PanelShell isOpen={isOpen} onClose={onClose} title="Campaigns" icon={<Megaphone className="h-4 w-4" />}>
      <CampaignList
        campaigns={campaigns}
        isLoading={isLoading}
        onViewCampaign={setViewingCampaign}
        onDeleteCampaign={deleteCampaign}
        onRenameCampaign={updateCampaignName}
        onArchiveCampaign={(id) => updateCampaignStatus(id, 'archived')}
      />
    </PanelShell>
  );
};

export const CampaignsPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = (props) => (
  <ContentGenerationProvider>
    <CampaignsPanelInner {...props} />
  </ContentGenerationProvider>
);
