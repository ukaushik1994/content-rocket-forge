
import { SerpAnalysisPanel as CoreSerpAnalysisPanel } from '@/components/content/SerpAnalysisPanel';
import { SerpAnalysisResult } from '@/types/serp';

interface SerpAnalysisPanelProps {
  serpData: SerpAnalysisResult | null;
  isLoading: boolean;
  mainKeyword: string;
  onAddToContent?: (content: string, type: string) => void;
  onRetry?: () => void;
}

export function SerpAnalysisPanel(props: SerpAnalysisPanelProps) {
  return <CoreSerpAnalysisPanel {...props} />;
}
