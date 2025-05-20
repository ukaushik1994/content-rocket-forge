
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, Info } from 'lucide-react';
import { useApproval } from '../context/ApprovalContext';
import { analyzeSerpKeyword } from '@/services/serpApiService';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ApprovalSerpSummaryProps {
  className?: string;
}

export const ApprovalSerpSummary: React.FC<ApprovalSerpSummaryProps> = ({ className }) => {
  const { 
    keywords, 
    selectedKeyword, 
    setSelectedKeyword, 
    serpAnalysisData,
    analyzeSerpData,
    isAnalyzing
  } = useApproval();
  
  // Analyze the first keyword if we have one and no analysis yet
  useEffect(() => {
    const analyzeFirstKeyword = async () => {
      if (keywords.length > 0 && !serpAnalysisData[keywords[0]] && !isAnalyzing) {
        analyzeSerpData(keywords[0]);
        setSelectedKeyword(keywords[0]);
      }
    };
    
    analyzeFirstKeyword();
  }, [keywords, serpAnalysisData, isAnalyzing]);
  
  // Get the currently selected SERP data
  const selectedSerpData = selectedKeyword ? serpAnalysisData[selectedKeyword] : null;
  
  // Handle selecting a keyword
  const handleSelectKeyword = (keyword: string) => {
    setSelectedKeyword(keyword);
    
    // If we don't have SERP data for this keyword yet, analyze it
    if (!serpAnalysisData[keyword] && !isAnalyzing) {
      analyzeSerpData(keyword);
    }
  };
  
  // Handle refreshing SERP data
  const handleRefreshSerpData = () => {
    if (selectedKeyword) {
      analyzeSerpData(selectedKeyword);
    }
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>SERP Analysis</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={handleRefreshSerpData}
                  disabled={isAnalyzing || !selectedKeyword}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh SERP data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <Badge 
                key={keyword}
                variant={selectedKeyword === keyword ? "default" : "outline"}
                className={cn(
                  "cursor-pointer",
                  selectedKeyword === keyword ? "bg-blue-600" : "hover:bg-blue-100 hover:text-blue-800",
                  !serpAnalysisData[keyword] && "opacity-50"
                )}
                onClick={() => handleSelectKeyword(keyword)}
              >
                {keyword}
                {(!serpAnalysisData[keyword] && selectedKeyword === keyword && isAnalyzing) && (
                  <RefreshCw className="h-3 w-3 ml-1.5 animate-spin" />
                )}
              </Badge>
            ))}
            {keywords.length === 0 && (
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Info className="h-3 w-3" />
                No keywords added yet
              </div>
            )}
          </div>
          
          {isAnalyzing && selectedKeyword && (
            <div className="text-xs text-muted-foreground animate-pulse">
              Analyzing {selectedKeyword}...
            </div>
          )}
          
          <ScrollArea className="h-[240px] pr-3">
            {selectedKeyword && selectedSerpData ? (
              <div className="space-y-4">
                {/* Search Volume */}
                <div className="space-y-1.5">
                  <div className="text-xs font-medium opacity-60">Search Volume</div>
                  <div className="text-sm font-semibold">
                    {selectedSerpData.searchVolume?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                
                {/* Top Results */}
                <div className="space-y-1.5">
                  <div className="text-xs font-medium opacity-60">Top Results</div>
                  <div className="space-y-2">
                    {selectedSerpData.topResults?.slice(0, 3).map((result: any, idx: number) => (
                      <div key={idx} className="text-xs border-l-2 border-blue-500 pl-2">
                        <div className="font-medium truncate">{result.title}</div>
                        <div className="text-muted-foreground truncate">{result.domain}</div>
                      </div>
                    ))}
                    {(!selectedSerpData.topResults || selectedSerpData.topResults.length === 0) && (
                      <div className="text-xs text-muted-foreground">No top results available</div>
                    )}
                  </div>
                </div>
                
                {/* Related Searches */}
                <div className="space-y-1.5">
                  <div className="text-xs font-medium opacity-60">Related Searches</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSerpData.relatedSearches?.slice(0, 5).map((search: any, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-[10px] bg-slate-100 text-slate-800">
                        {search.query || search}
                      </Badge>
                    ))}
                    {(!selectedSerpData.relatedSearches || selectedSerpData.relatedSearches.length === 0) && (
                      <div className="text-xs text-muted-foreground">No related searches available</div>
                    )}
                  </div>
                </div>
                
                {/* People Also Ask */}
                <div className="space-y-1.5">
                  <div className="text-xs font-medium opacity-60">People Also Ask</div>
                  <div className="space-y-2">
                    {selectedSerpData.peopleAlsoAsk?.slice(0, 3).map((item: any, idx: number) => (
                      <div key={idx} className="text-xs">
                        <div className="font-medium">{item.question}</div>
                      </div>
                    ))}
                    {(!selectedSerpData.peopleAlsoAsk || selectedSerpData.peopleAlsoAsk.length === 0) && (
                      <div className="text-xs text-muted-foreground">No questions available</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                {selectedKeyword ? (
                  isAnalyzing ? (
                    <div className="space-y-3">
                      <RefreshCw className="h-5 w-5 mx-auto animate-spin text-blue-500" />
                      <p className="text-sm text-muted-foreground">Analyzing keyword...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Search className="h-5 w-5 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No SERP data for this keyword</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => analyzeSerpData(selectedKeyword)}
                        disabled={isAnalyzing}
                      >
                        Analyze Now
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="space-y-3">
                    <Search className="h-5 w-5 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {keywords.length > 0 ? 'Select a keyword to view SERP data' : 'Add keywords to analyze SERP data'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
