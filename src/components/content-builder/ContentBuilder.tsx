import React, { useEffect, useState } from 'react';
import { useContentBuilder, ContentBuilderProvider } from '@/contexts/content-builder/ContentBuilderContext';
import { toast } from "sonner";
import { getApiKey } from '@/services/apiKeyService';
import { migrateExistingAPIKeys } from '@/utils/migrateAIProviders';
import { useTemplateInitialization } from '@/hooks/useTemplateInitialization';
import { useSettings } from '@/contexts/SettingsContext';
import { SinglePageContentBuilder } from './SinglePageContentBuilder';

interface ContentBuilderProps {
  initialKeyword?: string;
  selectedKeywords?: string[];
  location?: string;
  serpData?: any;
  initialStep?: number;
  strategyContext?: {
    proposal_id: string;
    priority_tag: string;
    estimated_impressions: number;
  } | null;
  metaSuggestions?: {
    title: string;
    description: string;
  } | null;
  suggestedTitle?: string | null;
  suggestedOutline?: string[] | null;
  additionalInstructions?: string | null;
  sourceInfo?: {
    type: 'proposal' | 'calendar';
    id?: string;
    data?: any;
  } | null;
}

export const ContentBuilder: React.FC<ContentBuilderProps> = ({
  initialKeyword,
  selectedKeywords,
  location,
  serpData,
  initialStep,
  strategyContext,
  metaSuggestions,
  suggestedTitle,
  suggestedOutline,
  additionalInstructions,
  sourceInfo
}) => {
  const { state, dispatch, addSerpSelections } = useContentBuilder();
  const { openSettings } = useSettings();
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'found' | 'not-found' | 'error'>('checking');

  // Initialize templates
  useTemplateInitialization();

  // Check for pending SERP selections from Answer the People
  useEffect(() => {
    const pendingSelections = localStorage.getItem('pendingSerpSelections');
    if (pendingSelections) {
      try {
        const selections = JSON.parse(pendingSelections);
        if (Array.isArray(selections) && selections.length > 0) {
          addSerpSelections(selections);
          localStorage.removeItem('pendingSerpSelections');
          toast.success(`Imported ${selections.length} questions from Answer the People`, {
            description: "Questions have been added to your SERP selections"
          });
        }
      } catch (error) {
        console.error('Error processing pending SERP selections:', error);
        localStorage.removeItem('pendingSerpSelections');
      }
    }
  }, [addSerpSelections]);

  // Initialize with preloaded data and strategy context
  useEffect(() => {
    if (initialKeyword || selectedKeywords || location || serpData || initialStep !== undefined || strategyContext) {
      dispatch({
        type: 'LOAD_PRELOADED_DATA',
        payload: {
          mainKeyword: initialKeyword,
          selectedKeywords,
          location,
          serpData,
          step: initialStep,
          strategySource: strategyContext
        }
      });

      if (suggestedTitle) {
        dispatch({ type: 'SET_CONTENT_TITLE', payload: suggestedTitle });
      }
      if (metaSuggestions) {
        dispatch({ type: 'SET_META_TITLE', payload: metaSuggestions.title });
        dispatch({ type: 'SET_META_DESCRIPTION', payload: metaSuggestions.description });
      }

      if (initialStep !== undefined && initialStep > 0) {
        for (let i = 0; i < initialStep; i++) {
          dispatch({ type: 'MARK_STEP_COMPLETED', payload: i });
        }
        if (serpData && initialStep >= 2) {
          dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });
        }
      }

      if (strategyContext && initialKeyword) {
        dispatch({ type: 'MARK_STEP_COMPLETED', payload: 0 });
      }

      if (additionalInstructions) {
        dispatch({ type: 'SET_ADDITIONAL_INSTRUCTIONS', payload: additionalInstructions });
      }

      if (sourceInfo?.type === 'proposal') {
        toast.success('Content builder loaded with proposal data', {
          id: 'source-info-toast',
          description: 'Title, keywords, and instructions have been pre-populated from your proposal.'
        });
      } else if (sourceInfo?.type === 'calendar') {
        toast.success('Content builder loaded with calendar item data', {
          id: 'source-info-toast',
          description: 'Basic information has been pre-populated from your calendar item.'
        });
      }
    }
  }, [initialKeyword, selectedKeywords, location, serpData, initialStep, strategyContext, metaSuggestions, suggestedTitle, additionalInstructions, sourceInfo, dispatch]);

  // Initialize AI provider preferences and check for SERP API key
  useEffect(() => {
    const initializeServices = async () => {
      setApiKeyStatus('checking');
      try {
        await migrateExistingAPIKeys();
        const serpApiKey = await getApiKey('serp');
        if (serpApiKey) {
          localStorage.setItem('serp_api_key', serpApiKey);
          setApiKeyStatus('found');
        } else {
          const localStorageKey = localStorage.getItem('serp_api_key');
          setApiKeyStatus(localStorageKey ? 'found' : 'not-found');
        }
      } catch (error) {
        console.error('Error initializing services:', error);
        setApiKeyStatus('error');
      }
    };
    initializeServices();
  }, []);

  // Display API key status warning
  useEffect(() => {
    if (apiKeyStatus === 'not-found') {
      toast.warning("No SERP API key found. Please add your API key in Settings to see real data.", {
        id: 'serp-api-warning',
        duration: 8000,
        action: {
          label: "Go to Settings",
          onClick: () => openSettings('api')
        }
      });
    } else if (apiKeyStatus === 'error') {
      toast.error("Error checking for SERP API key. You'll see mock data instead.", {
        id: 'serp-api-error',
        duration: 8000
      });
    }
  }, [apiKeyStatus]);

  return <SinglePageContentBuilder />;
};

// Safe default export that ensures a Provider is present
export const ContentBuilderWithProvider: React.FC<ContentBuilderProps> = props => (
  <ContentBuilderProvider>
    <ContentBuilder {...props} />
  </ContentBuilderProvider>
);

export default ContentBuilderWithProvider;