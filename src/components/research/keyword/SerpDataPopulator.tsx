import React, { useEffect } from 'react';
import { keywordLibraryService } from '@/services/keywordLibraryService';
import { toast } from 'sonner';

interface SerpDataPopulatorProps {
  serpData: any;
  mainKeyword: string;
  enabled: boolean;
  onPopulationComplete?: () => void;
}

/**
 * Auto-population component that bridges SERP research with keyword library
 * Automatically saves researched keywords with fresh SERP metrics
 */
export const SerpDataPopulator: React.FC<SerpDataPopulatorProps> = ({
  serpData,
  mainKeyword,
  enabled,
  onPopulationComplete
}) => {
  useEffect(() => {
    if (!enabled || !serpData || !mainKeyword) return;

    const populateKeywordLibrary = async () => {
      try {
        // Save main keyword with comprehensive SERP data
        await keywordLibraryService.upsertKeywordWithSerpData(
          mainKeyword,
          {
            searchVolume: serpData.searchVolume,
            difficulty: serpData.difficulty,
            competitionScore: serpData.competitionScore,
            cpc: serpData.cpc,
            intent: serpData.intent,
            trend: serpData.trend,
            dataQuality: serpData.isGoogleData ? 'high' : 'medium',
            seasonality: serpData.seasonality || false
          },
          'serp'
        );

        // Auto-populate related keywords
        if (serpData.keywords && Array.isArray(serpData.keywords)) {
          const keywordPromises = serpData.keywords.slice(0, 10).map(async (keyword) => {
            try {
              await keywordLibraryService.upsertKeywordWithSerpData(
                keyword.keyword || keyword,
                {
                  searchVolume: keyword.searchVolume,
                  difficulty: keyword.difficulty,
                  competitionScore: keyword.competitionScore,
                  dataQuality: 'medium'
                },
                'serp_related'
              );
            } catch (error) {
              console.error(`Failed to save related keyword: ${keyword.keyword || keyword}`, error);
            }
          });

          await Promise.allSettled(keywordPromises);
        }

        // Auto-populate People Also Ask questions as keywords
        if (serpData.peopleAlsoAsk && Array.isArray(serpData.peopleAlsoAsk)) {
          const paaPromises = serpData.peopleAlsoAsk.slice(0, 5).map(async (question) => {
            try {
              const questionKeyword = question.question || question;
              await keywordLibraryService.upsertKeywordWithSerpData(
                questionKeyword,
                {
                  intent: 'informational',
                  dataQuality: 'medium'
                },
                'paa'
              );
            } catch (error) {
              console.error(`Failed to save PAA keyword: ${question.question || question}`, error);
            }
          });

          await Promise.allSettled(paaPromises);
        }

        console.log('✅ Keyword library populated with SERP research data');
        
        // Show success notification
        toast.success("🎯 Auto-populated keyword library", {
          description: "Research data automatically saved with SERP metrics"
        });
        
        // Notify parent component to refresh library
        if (onPopulationComplete) {
          onPopulationComplete();
        }
      } catch (error) {
        console.error('Error populating keyword library:', error);
        toast.error('Failed to auto-populate keyword library');
      }
    };

    // Debounce the population to avoid excessive API calls
    const timer = setTimeout(populateKeywordLibrary, 2000);
    return () => clearTimeout(timer);
  }, [serpData, mainKeyword, enabled]);

  return null; // This is a utility component with no UI
};

export default SerpDataPopulator;