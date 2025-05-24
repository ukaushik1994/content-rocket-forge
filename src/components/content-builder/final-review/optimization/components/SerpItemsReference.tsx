import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
interface SerpItemsReferenceProps {
  onIncorporateAllSerp: () => void;
}
export function SerpItemsReference({
  onIncorporateAllSerp
}: SerpItemsReferenceProps) {
  const {
    state
  } = useContentBuilder();
  const {
    mainKeyword,
    selectedKeywords,
    serpSelections
  } = state;
  const selectedSerpItems = serpSelections?.filter(item => item.selected) || [];
  const selectedKeywordItems = selectedSerpItems.filter(item => item.type === 'keyword');
  const selectedQuestions = selectedSerpItems.filter(item => item.type === 'question');
  const selectedHeadings = selectedSerpItems.filter(item => item.type === 'heading');
  const selectedEntities = selectedSerpItems.filter(item => item.type === 'entity');
  const selectedContentGaps = selectedSerpItems.filter(item => item.type === 'contentGap');
  const selectedTopRanks = selectedSerpItems.filter(item => item.type === 'topRank');
  if (selectedKeywords.length === 0 && selectedSerpItems.length === 0) return null;
  return <div className="mb-4 p-3 border border-dashed rounded-md bg-secondary/10">
      <h4 className="text-sm font-medium mb-2">Keywords to Incorporate</h4>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {mainKeyword && <Badge className="bg-blue-600 hover:bg-blue-700">{mainKeyword} (main)</Badge>}
        {selectedKeywords.map((keyword, idx) => <Badge key={`keyword-${idx}`} className="bg-blue-500/70 hover:bg-blue-500">{keyword}</Badge>)}
        {selectedKeywordItems.map((item, idx) => <Badge key={`serp-keyword-${idx}`} className="bg-blue-400/60 hover:bg-blue-400">{item.content}</Badge>)}
      </div>

      {/* All Other SERP Items */}
      {(selectedQuestions.length > 0 || selectedHeadings.length > 0 || selectedEntities.length > 0 || selectedContentGaps.length > 0 || selectedTopRanks.length > 0) && <>
          <h4 className="text-sm font-medium mb-2">Selected SERP Items to Integrate</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedQuestions.length > 0 && <div>
                <span className="text-xs font-medium text-purple-600">Questions ({selectedQuestions.length}):</span>
                <div className="flex flex-wrap gap-1 mt-1 bg-slate-950">
                  {selectedQuestions.map((item, idx) => <Badge key={`question-${idx}`} variant="outline" className="text-xs bg-purple-50 border-purple-200">
                      {item.content.substring(0, 50)}...
                    </Badge>)}
                </div>
              </div>}
            
            {selectedHeadings.length > 0 && <div>
                <span className="text-xs font-medium text-green-600">Headings ({selectedHeadings.length}):</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedHeadings.map((item, idx) => <Badge key={`heading-${idx}`} variant="outline" className="text-xs bg-green-50 border-green-200">
                      {item.content}
                    </Badge>)}
                </div>
              </div>}
            
            {selectedEntities.length > 0 && <div>
                <span className="text-xs font-medium text-orange-600">Entities ({selectedEntities.length}):</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedEntities.map((item, idx) => <Badge key={`entity-${idx}`} variant="outline" className="text-xs bg-orange-50 border-orange-200">
                      {item.content}
                    </Badge>)}
                </div>
              </div>}
            
            {selectedContentGaps.length > 0 && <div>
                <span className="text-xs font-medium text-red-600">Content Gaps ({selectedContentGaps.length}):</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedContentGaps.map((item, idx) => <Badge key={`gap-${idx}`} variant="outline" className="text-xs bg-red-50 border-red-200">
                      {item.content.substring(0, 40)}...
                    </Badge>)}
                </div>
              </div>}
          </div>

          <Button variant="outline" size="sm" className="mt-3 w-full text-xs" onClick={onIncorporateAllSerp}>
            <Plus className="h-3 w-3 mr-1" />
            Incorporate All SERP Items
          </Button>
        </>}
    </div>;
}