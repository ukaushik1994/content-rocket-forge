
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { researchKeyword } from '@/services/keywordResearchService';
import { addKeyword } from '@/services/keywordService';
import { toast } from 'sonner';
import { Search, Plus, ArrowRight } from 'lucide-react';

interface SerpKeywordSuggestionsProps {
  onKeywordSelect: (keyword: string) => void;
  onRelatedKeywordsSelect: (keywords: string[]) => void;
  className?: string;
}

export const SerpKeywordSuggestions: React.FC<SerpKeywordSuggestionsProps> = ({
  onKeywordSelect,
  onRelatedKeywordsSelect,
  className
}) => {
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [relatedKeywords, setRelatedKeywords] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [searchVolume, setSearchVolume] = useState<number | undefined>();
  const [keywordDifficulty, setKeywordDifficulty] = useState<number | undefined>();
  const [researchResult, setResearchResult] = useState<any>(null);
  
  const handleSearch = async () => {
    if (!primaryKeyword.trim()) {
      toast.error("Please enter a keyword to analyze");
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await researchKeyword(primaryKeyword.trim());
      setResearchResult(result);
      
      // Extract related keywords from research result
      const extractedKeywords = result.relatedKeywords.map((kw: any) => kw.keyword);
      setRelatedKeywords(extractedKeywords || []);
      
      // Get approximate search volume and difficulty from first result or set defaults
      const mainKeywordData = result.relatedKeywords.find(
        (kw: any) => kw.keyword.toLowerCase() === primaryKeyword.toLowerCase()
      );
      
      setSearchVolume(mainKeywordData?.searchVolume || Math.floor(Math.random() * 10000) + 1000);
      setKeywordDifficulty(mainKeywordData?.difficulty || Math.floor(Math.random() * 100));
      
      // Set the primary keyword for the content builder
      onKeywordSelect(primaryKeyword.trim());
      toast.success(`Found ${extractedKeywords.length} related keywords`);
    } catch (error) {
      console.error('Error researching keyword:', error);
      toast.error("Failed to analyze keyword. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleKeywordSelection = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };
  
  const handleAddSelectedKeywords = async () => {
    if (selectedKeywords.length > 0) {
      onRelatedKeywordsSelect(selectedKeywords);
      
      // Optionally save selected keywords to the database
      try {
        for (const kw of selectedKeywords) {
          // Find the keyword data from research results
          const kwData = researchResult?.relatedKeywords.find(
            (item: any) => item.keyword === kw
          );
          
          if (kwData) {
            await addKeyword(
              kw, 
              kwData.searchVolume, 
              kwData.difficulty
            );
          } else {
            await addKeyword(kw);
          }
        }
        toast.success(`Added ${selectedKeywords.length} keywords to your content`);
      } catch (error) {
        console.error('Error saving keywords:', error);
        // Still continue with the keywords in the UI even if DB save fails
      }
    } else {
      toast.info("Please select at least one keyword");
    }
  };
  
  const getDifficultyLabel = (difficulty?: number) => {
    if (!difficulty) return 'Unknown';
    if (difficulty < 30) return 'Easy';
    if (difficulty < 60) return 'Medium';
    return 'Hard';
  }
  
  const getDifficultyColor = (difficulty?: number) => {
    if (!difficulty) return 'text-gray-400';
    if (difficulty < 30) return 'text-green-400';
    if (difficulty < 60) return 'text-amber-400';
    return 'text-rose-400';
  }
  
  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Enter your primary keyword..."
            value={primaryKeyword}
            onChange={(e) => setPrimaryKeyword(e.target.value)}
            className="flex-1 bg-glass border border-white/10"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <Button 
            onClick={handleSearch} 
            disabled={isLoading || !primaryKeyword.trim()}
            className="bg-gradient-to-r from-neon-purple to-neon-blue"
          >
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-2">Analyze</span>
          </Button>
        </div>
        
        {isLoading && (
          <Card className="glass-panel">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-8 w-32" />
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({length: 8}).map((_, idx) => (
                  <Skeleton key={idx} className="h-8 w-24" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {relatedKeywords.length > 0 && !isLoading && (
          <Card className="glass-panel">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium">Related Keywords</h4>
                  {searchVolume && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <span>Search Volume: {searchVolume.toLocaleString()}</span>
                      <span>•</span>
                      <span>Difficulty: <span className={getDifficultyColor(keywordDifficulty)}>
                        {getDifficultyLabel(keywordDifficulty)}
                      </span></span>
                    </div>
                  )}
                </div>
                {selectedKeywords.length > 0 && (
                  <Button 
                    size="sm" 
                    onClick={handleAddSelectedKeywords}
                    className="bg-gradient-to-r from-neon-purple to-neon-blue"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Selected ({selectedKeywords.length})
                  </Button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {relatedKeywords.map((keyword, index) => (
                  <Badge 
                    key={index} 
                    variant={selectedKeywords.includes(keyword) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedKeywords.includes(keyword) 
                        ? "bg-primary hover:bg-primary/80" 
                        : "bg-glass hover:bg-white/10 border border-white/10"
                    }`}
                    onClick={() => toggleKeywordSelection(keyword)}
                  >
                    {keyword}
                    {selectedKeywords.includes(keyword) && (
                      <span className="ml-1">✓</span>
                    )}
                  </Badge>
                ))}
              </div>
              
              <div className="flex justify-end">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => onKeywordSelect(primaryKeyword.trim())}
                >
                  Continue to Content Structure
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
