
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, RefreshCw, Plus } from 'lucide-react';

interface KeywordSelectionContentProps {
  mainKeyword: string;
  keywordSuggestions: string[];
  selectedKeyword: string;
  relatedKeywords: string[];
  isLoadingKeywordData: boolean;
  isAnalyzing: boolean;
  onKeywordSearch: (keyword: string, searchSuggestions: string[]) => Promise<void>;
  onKeywordSelect: (keyword: string) => void;
  onContinue: () => Promise<void>;
}

export const KeywordSelectionContent: React.FC<KeywordSelectionContentProps> = ({
  mainKeyword,
  keywordSuggestions,
  selectedKeyword,
  relatedKeywords,
  isLoadingKeywordData,
  isAnalyzing,
  onKeywordSearch,
  onKeywordSelect,
  onContinue
}) => {
  const [inputKeyword, setInputKeyword] = React.useState(mainKeyword || '');
  const [suggestions, setSuggestions] = React.useState<string[]>([]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputKeyword(value);
    
    // Generate simple suggestions based on the input
    if (value.trim().length > 2) {
      const mockSuggestions = [
        `${value} guide`,
        `best ${value}`,
        `${value} tutorial`,
        `how to ${value}`,
        `${value} tips`,
        `${value} examples`
      ];
      setSuggestions(mockSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (inputKeyword.trim()) {
      onKeywordSearch(inputKeyword.trim(), suggestions);
    }
  };

  // Handle keydown events (for Enter key)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Enter your primary keyword..."
                value={inputKeyword}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch} 
                disabled={isAnalyzing || !inputKeyword.trim()}
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Analyze
              </Button>
            </div>

            {suggestions.length > 0 && !mainKeyword && (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Badge 
                      key={index} 
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => {
                        setInputKeyword(suggestion);
                        onKeywordSearch(suggestion, suggestions);
                      }}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {mainKeyword && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Selected Keyword */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Selected Keyword</p>
                  <p className="text-xl font-semibold">{mainKeyword}</p>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={onContinue} 
                    disabled={isAnalyzing}
                    className="gap-2"
                  >
                    {isAnalyzing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Keywords */}
          {relatedKeywords.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Related Keywords</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {relatedKeywords.map((keyword, index) => (
                        <Badge 
                          key={index} 
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10"
                          onClick={() => onKeywordSelect(keyword)}
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
