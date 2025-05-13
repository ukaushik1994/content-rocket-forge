
import { SerpAnalysisPanel as CoreSerpAnalysisPanel } from '@/components/content/SerpAnalysisPanel';
import { SerpAnalysisResult } from '@/types/serp';

interface SerpAnalysisPanelProps {
  serpData: SerpAnalysisResult | null;
  isLoading?: boolean;
  mainKeyword?: string;
  onAddToContent?: (content: string, type: string) => void;
  onRetry?: () => void;
  maxItemsToShow?: number;
}

export function SerpAnalysisPanel(props: SerpAnalysisPanelProps) {
  // Ensure isLoading is always defined
  const updatedProps = {
    ...props,
    isLoading: props.isLoading ?? false,
    mainKeyword: props.mainKeyword ?? ''
  };
  
  return <CoreSerpAnalysisPanel {...updatedProps} />;
}
