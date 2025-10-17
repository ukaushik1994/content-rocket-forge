import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { generateMetaSuggestions } from '@/utils/seo/meta/generateMetaSuggestions';

interface StrategyContextInitializerProps {
  proposal: any;
  children: React.ReactNode;
}

export function StrategyContextInitializer({ proposal, children }: StrategyContextInitializerProps) {
  const { 
    setMainKeyword, 
    setContentTitle, 
    setMetaTitle, 
    setMetaDescription,
    setContentType,
    setContentFormat,
    setContentIntent,
    setStrategySource,
    state
  } = useContentBuilder();
  
  // Initialize context immediately when proposal changes
  useEffect(() => {
    if (!proposal) return;
    
    console.log('[StrategyContextInit] Initializing with proposal:', proposal);
    
    // Set main keyword from proposal if available
    if (proposal.primary_keyword && proposal.primary_keyword !== state.mainKeyword) {
      console.log('[StrategyContextInit] Setting mainKeyword:', proposal.primary_keyword);
      setMainKeyword(proposal.primary_keyword);
    }
    
    // Set content title from proposal if available
    if (proposal.title && proposal.title !== state.contentTitle) {
      console.log('[StrategyContextInit] Setting contentTitle:', proposal.title);
      setContentTitle(proposal.title);
      
      // Set meta title separately - try meta_suggestions first, then generate SEO-optimized version
      const metaTitleToUse = proposal.meta_suggestions?.title 
        || generateMetaSuggestions(
            proposal.description || '', 
            proposal.primary_keyword || '', 
            proposal.title
          ).metaTitle;
      
      console.log('[StrategyContextInit] Setting metaTitle (distinct from contentTitle):', metaTitleToUse);
      setMetaTitle(metaTitleToUse);
    }
    
    // Set default content settings optimized for strategy
    if (state.contentType !== 'blog') {
      setContentType('blog');
    }
    if (state.contentFormat !== 'long-form') {
      setContentFormat('long-form');
    }
    if (state.contentIntent !== 'inform') {
      setContentIntent('inform');
    }
    
    // Set enhanced meta description with strategy context
    const description = proposal.description || 
      `A comprehensive guide about ${proposal.primary_keyword || 'your topic'}. ` +
      `Discover strategies, insights, and solutions to help you succeed.`;
    
    if (description !== state.metaDescription) {
      setMetaDescription(description);
    }
    
    // CRITICAL: Set strategy source immediately for proper tracking throughout workflow
    if (proposal.id) {
      console.log('[StrategyContextInit] Setting strategySource:', {
        proposal_id: proposal.id,
        priority_tag: proposal.priority_tag,
        estimated_impressions: proposal.estimated_impressions
      });
      
      setStrategySource({
        proposal_id: proposal.id,
        priority_tag: proposal.priority_tag || 'evergreen',
        estimated_impressions: proposal.estimated_impressions || 0,
        meta_suggestions: {
          title: proposal.title || '',
          description: description
        }
      });
    }
    
  }, [proposal, setMainKeyword, setContentTitle, setMetaTitle, setMetaDescription, setContentType, setContentFormat, setContentIntent, setStrategySource, state]);
  
  return <>{children}</>;
}