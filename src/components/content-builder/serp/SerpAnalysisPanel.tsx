
import React from 'react';
import { SerpAnalysisPanel as CoreSerpAnalysisPanel } from '@/components/content/SerpAnalysisPanel';
import { SerpAnalysisResult } from '@/types/serp';
import { toast } from 'sonner';
import { analyzeKeywordSerp } from '@/services/serpApiService';

interface SerpAnalysisPanelProps {
  serpData: SerpAnalysisResult | null;
  isLoading: boolean;
  mainKeyword: string;
  onAddToContent?: (content: string, type: string) => void;
  onRetry?: () => void;
  onSerpDataChange?: (data: SerpAnalysisResult | null) => void;
}

export function SerpAnalysisPanel(props: SerpAnalysisPanelProps) {
  const { 
    serpData, 
    mainKeyword, 
    onSerpDataChange = () => {},
    isLoading: externalLoading
  } = props;
  
  const [isLocalLoading, setIsLocalLoading] = React.useState(false);
  const isLoading = externalLoading || isLocalLoading;

  // If we have a mainKeyword but no serpData, try to fetch it automatically
  React.useEffect(() => {
    const fetchSerpData = async () => {
      if (mainKeyword && !serpData && !isLoading) {
        setIsLocalLoading(true);
        try {
          console.log("Automatically fetching SERP data for:", mainKeyword);
          const data = await analyzeKeywordSerp(mainKeyword);
          if (data) {
            onSerpDataChange(data);
            if (data.isMockData) {
              toast.warning("Using mock data. Add your SERP API key for real results.", {
                duration: 5000,
                action: {
                  label: "Add Key",
                  onClick: () => {
                    const settingsUrl = window.location.pathname.includes('/content-builder')
                      ? '/content-builder?step=2&showApiSetup=true'
                      : '/settings/api';
                    window.location.href = settingsUrl;
                  }
                }
              });
            } else {
              toast.success("Retrieved real SERP data successfully!");
            }
          }
        } catch (error) {
          console.error("Error auto-fetching SERP data:", error);
        } finally {
          setIsLocalLoading(false);
        }
      }
    };
    
    fetchSerpData();
  }, [mainKeyword, serpData, isLoading, onSerpDataChange]);
  
  // Pass all props to the core component
  return <CoreSerpAnalysisPanel {...props} isLoading={isLoading} />;
}
