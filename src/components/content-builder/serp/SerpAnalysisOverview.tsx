
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SerpAnalysisResult } from '@/services/serpApiService';
import { SerpSelection } from '@/contexts/ContentBuilderContext';

interface SerpAnalysisOverviewProps {
  serpData: SerpAnalysisResult;
  selectedCounts: {
    question: number;
    keyword: number;
    snippet: number;
    competitor: number;
  };
  totalSelected: number;
  getItemsByType: (type: string) => SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
}

export const SerpAnalysisOverview: React.FC<SerpAnalysisOverviewProps> = ({
  serpData,
  selectedCounts,
  totalSelected,
  getItemsByType,
  handleToggleSelection
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Keyword Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Search Volume:</span>
                <span className="font-medium">{serpData.searchVolume || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Difficulty:</span>
                <span className="font-medium">{serpData.keywordDifficulty || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Competition:</span>
                <span className="font-medium">{serpData.competitionScore || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Content Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {serpData.recommendations && serpData.recommendations.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {serpData.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm">{recommendation}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No recommendations available.</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Selected Items</CardTitle>
          </CardHeader>
          <CardContent>
            {totalSelected > 0 ? (
              <div className="space-y-4">
                {selectedCounts.question > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Questions ({selectedCounts.question})</h4>
                    <div className="flex flex-wrap gap-2">
                      {getItemsByType('question').filter(item => item.selected).map((item, i) => (
                        <Badge key={i} variant="outline" className="flex items-center gap-1">
                          {item.content.length > 50 ? item.content.substring(0, 50) + '...' : item.content}
                          <button 
                            onClick={() => handleToggleSelection(item.type, item.content)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedCounts.keyword > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Keywords ({selectedCounts.keyword})</h4>
                    <div className="flex flex-wrap gap-2">
                      {getItemsByType('keyword').filter(item => item.selected).map((item, i) => (
                        <Badge key={i} variant="outline" className="flex items-center gap-1 bg-blue-50">
                          {item.content}
                          <button 
                            onClick={() => handleToggleSelection(item.type, item.content)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedCounts.snippet > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Snippets ({selectedCounts.snippet})</h4>
                    <div className="flex flex-wrap gap-2">
                      {getItemsByType('snippet').filter(item => item.selected).map((item, i) => (
                        <Badge key={i} variant="outline" className="flex items-center gap-1 bg-green-50">
                          {item.content.length > 50 ? item.content.substring(0, 50) + '...' : item.content}
                          <button 
                            onClick={() => handleToggleSelection(item.type, item.content)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  No items selected yet. Browse through the tabs to select content for your outline.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
