
import React from 'react';
import { SerpAnalysisPanel as CoreSerpAnalysisPanel } from '@/components/content/SerpAnalysisPanel';
import { SerpAnalysisResult } from '@/types/serp';
import { toast } from 'sonner';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { SelectedItemsSidebar } from '../steps/serp-analysis/SelectedItemsSidebar';
import { SerpSelectionStats } from '../steps/serp-analysis/SerpSelectionStats';

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
  
  const { state, dispatch } = useContentBuilder();
  const { serpSelections } = state;
  
  const [isLocalLoading, setIsLocalLoading] = React.useState(false);
  const [dataSource, setDataSource] = React.useState<'real' | 'mock' | 'loading' | null>(null);
  const isLoading = externalLoading || isLocalLoading;

  // Get selection statistics
  const { selectedCounts, totalSelected } = SerpSelectionStats({ serpSelections });
  
  // Helper function to toggle selection state
  const handleToggleSelection = (type: string, content: string) => {
    dispatch({
      type: 'TOGGLE_SERP_SELECTION',
      payload: { type, content }
    });
  };

  // If we have a mainKeyword but no serpData, try to fetch it automatically
  React.useEffect(() => {
    const fetchSerpData = async () => {
      if (mainKeyword && !serpData && !isLoading) {
        setIsLocalLoading(true);
        setDataSource('loading');
        try {
          console.log("Automatically fetching SERP data for:", mainKeyword);
          const data = await analyzeKeywordSerp(mainKeyword);
          if (data) {
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
          }
        } catch (error) {
          console.error("Error auto-fetching SERP data:", error);
          setDataSource(null);
        } finally {
          setIsLocalLoading(false);
        }
      } else if (serpData) {
        // Update data source indicator based on serpData
        setDataSource(serpData.isMockData ? 'mock' : 'real');
      }
    };
    
    fetchSerpData();
  }, [mainKeyword, serpData, isLoading, onSerpDataChange]);
  
  // Pass all props to the core component with layout that includes right sidebar
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[400px]">
      {/* Main SERP Analysis Panel */}
      <div className="lg:col-span-3 relative">
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
      
      {/* Right Sidebar - Selected Items */}
      <div className="lg:col-span-1">
        <SelectedItemsSidebar 
          serpSelections={serpSelections}
          totalSelected={totalSelected}
          selectedCounts={selectedCounts}
          handleToggleSelection={handleToggleSelection}
        />
      </div>
    </div>
  );
}
