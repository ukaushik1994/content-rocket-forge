
import React from 'react';
import { SerpAnalysisPanel as CoreSerpAnalysisPanel } from '@/components/content/SerpAnalysisPanel';
import { SerpAnalysisResult } from '@/types/serp';
import { toast } from 'sonner';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

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
  const [dataSource, setDataSource] = React.useState<'real' | 'mock' | 'loading' | null>(null);
  const [hasAutoFetched, setHasAutoFetched] = React.useState(false);
  const isLoading = externalLoading || isLocalLoading;

  // Auto-fetch SERP data when keyword is available but no data exists
  React.useEffect(() => {
    const fetchSerpData = async () => {
      if (mainKeyword && !serpData && !isLoading && !hasAutoFetched) {
        console.log("🔄 Auto-fetching SERP data for keyword:", mainKeyword);
        setIsLocalLoading(true);
        setDataSource('loading');
        setHasAutoFetched(true);
        
        try {
          const data = await analyzeKeywordSerp(mainKeyword);
          if (data) {
            console.log("✅ Auto-fetch successful, data type:", data.isMockData ? 'mock' : 'real');
            onSerpDataChange(data);
            
            if (data.isMockData) {
              setDataSource('mock');
              toast.warning("Using mock data. Add your SERP API key for real results.", {
                duration: 5000,
                action: {
                  label: "Add Key",
                  onClick: () => {
                    window.location.href = "/content-builder?step=2&showApiSetup=true";
                  }
                }
              });
            } else {
              setDataSource('real');
              toast.success("Retrieved real SERP data successfully!");
            }
          } else {
            console.warn("⚠️ Auto-fetch returned no data");
            setDataSource(null);
          }
        } catch (error) {
          console.error("❌ Error auto-fetching SERP data:", error);
          setDataSource(null);
          toast.error("Failed to fetch SERP data. Please try again.");
        } finally {
          setIsLocalLoading(false);
        }
      } else if (serpData) {
        // Update data source indicator based on existing serpData
        setDataSource(serpData.isMockData ? 'mock' : 'real');
        console.log("📊 Data source updated:", serpData.isMockData ? 'mock' : 'real');
      }
    };
    
    fetchSerpData();
  }, [mainKeyword, serpData, isLoading, onSerpDataChange, hasAutoFetched]);

  // Reset hasAutoFetched when keyword changes
  React.useEffect(() => {
    setHasAutoFetched(false);
  }, [mainKeyword]);
  
  return (
    <div className="relative">
      {dataSource && !isLoading && (
        <div className="absolute top-4 right-4 z-10">
          <Badge 
            variant={dataSource === 'real' ? 'default' : 'secondary'}
            className={`flex items-center gap-1 ${
              dataSource === 'real' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            <Info className="h-3 w-3" />
            {dataSource === 'real' ? 'Real Data' : 'Mock Data'}
          </Badge>
        </div>
      )}
      <CoreSerpAnalysisPanel {...props} isLoading={isLoading} />
    </div>
  );
}
