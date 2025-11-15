import { useState, useEffect, useRef } from 'react';
import { CampaignStrategy, CampaignInput } from '@/types/campaign-types';
import { campaignService } from '@/services/campaignService';
import { toast } from 'sonner';

interface UseCampaignAutoSaveOptions {
  campaignId: string | null;
  strategy: CampaignStrategy | null;
  input: CampaignInput | null;
  userId: string;
  onCampaignCreated?: (campaignId: string) => void;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const useCampaignAutoSave = ({
  campaignId,
  strategy,
  input,
  userId,
  onCampaignCreated,
}: UseCampaignAutoSaveOptions) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Debounced auto-save effect (5 seconds after changes)
  useEffect(() => {
    // Don't auto-save if no strategy or input
    if (!strategy || !input || !userId) {
      return;
    }

    // Don't auto-save if already saving
    if (isSavingRef.current) {
      return;
    }

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(async () => {
      isSavingRef.current = true;
      setSaveStatus('saving');

      try {
        if (campaignId) {
          // Update existing campaign
          await campaignService.updateCampaign(campaignId, {
            selected_strategy: strategy,
            target_audience: input.targetAudience,
            goal: input.goal,
            timeline: input.timeline,
            status: 'planned', // Strategy exists, so it's planned
          });
        } else {
          // Create new campaign
          const generateCampaignName = (idea: string) => {
            const words = idea.split(' ').slice(0, 5).join(' ');
            return words.length > 50 ? words.substring(0, 47) + '...' : words;
          };

          const saved = await campaignService.saveCampaign(
            userId,
            generateCampaignName(input.idea),
            input.idea,
            strategy
          );

          // Update the campaign with context fields
          await campaignService.updateCampaign(saved.id, {
            target_audience: input.targetAudience,
            goal: input.goal,
            timeline: input.timeline,
            status: 'planned',
          });

          // Notify parent component that campaign was created
          if (onCampaignCreated) {
            onCampaignCreated(saved.id);
          }
        }

        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
        setSaveStatus('error');
        toast.error('Failed to save campaign');
      } finally {
        isSavingRef.current = false;
      }
    }, 5000); // 5 second debounce

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [strategy, input, campaignId, userId, onCampaignCreated]);

  return {
    saveStatus,
    lastSaved,
  };
};
