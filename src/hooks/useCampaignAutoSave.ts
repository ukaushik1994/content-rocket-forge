import { useState, useEffect, useRef } from 'react';
import { CampaignStrategy, CampaignInput } from '@/types/campaign-types';
import { campaignService } from '@/services/campaignService';
import { supabase } from '@/integrations/supabase/client';
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
    // Don't auto-save if no strategy or input or userId
    if (!strategy || !input || !userId || userId.trim() === '') {
      console.warn('Auto-save skipped: missing required data', { 
        hasStrategy: !!strategy, 
        hasInput: !!input, 
        userId 
      });
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
        // Verify user is still authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || session.user.id !== userId) {
          console.error('Auth session invalid for auto-save');
          setSaveStatus('error');
          toast.error('Please sign in again to save your campaign');
          isSavingRef.current = false;
          return;
        }

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
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.includes('JWT') || errorMessage.includes('auth')) {
          toast.error('Session expired. Please sign in again.');
        } else if (errorMessage.includes('RLS') || errorMessage.includes('policy')) {
          toast.error('Permission denied. Please check your account.');
        } else {
          toast.error('Failed to save campaign. Check your connection.');
        }
        
        setSaveStatus('error');
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
