
import React from 'react';
import { motion } from 'framer-motion';
import { SerpAnalysisResult } from '@/services/serpApiService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';

export interface SerpKeywordsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpKeywordsSection({ 
  serpData, 
  expanded,
  onAddToContent = () => {}
}: SerpKeywordsSectionProps) {
  if (!expanded) return null;
  
  const keywords = serpData.keywords || [];
  const relatedSearches = serpData.relatedSearches || [];
  
  if (keywords.length === 0 && relatedSearches.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No keywords available for this search term.</p>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-blue-500/20 shadow-lg bg-gradient-to-br from-blue-900/20 via-black/20 to-black/30 backdrop-blur-md overflow-hidden">
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Main keywords */}
            {keywords.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Primary Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="border-blue-500/30 bg-blue-900/10 hover:bg-blue-900/20 cursor-pointer group flex items-center gap-1"
                      onClick={() => onAddToContent(keyword, 'keyword')}
                    >
                      {keyword}
                      <Plus className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Related searches */}
            {relatedSearches.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Related Searches
                </h4>
                <div className="flex flex-wrap gap-2">
                  {relatedSearches.map((search, index) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="border-purple-500/30 bg-purple-900/10 hover:bg-purple-900/20 cursor-pointer group flex items-center gap-1"
                      onClick={() => onAddToContent(search.query, 'relatedSearch')}
                    >
                      {search.query}
                      {search.volume && <span className="text-xs opacity-70">({search.volume})</span>}
                      <Plus className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end mt-2">
        <Button 
          variant="outline"
          size="sm"
          className="text-xs border-blue-500/30 hover:bg-blue-500/20"
          onClick={() => {
            const allKeywords = [...keywords, ...relatedSearches.map(s => s.query)].join(', ');
            onAddToContent(allKeywords, 'allKeywords');
          }}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add all keywords
        </Button>
      </div>
    </motion.div>
  );
}
