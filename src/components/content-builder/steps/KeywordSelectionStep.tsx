import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SerpKeywordSuggestions } from '@/components/content/SerpKeywordSuggestions';
import { EnhancedKeywordSelection } from './keyword-selection/EnhancedKeywordSelection';
import { Search, Plus, X, Target, Sparkles, AlertTriangle } from 'lucide-react';
import { researchKeyword, KeywordResearchResult } from '@/services/keywordResearchService';
import { toast } from 'sonner';

export const KeywordSelectionStep = () => {
  const { state, setMainKeyword, addKeyword, removeKeyword, markStepCompleted, navigateToStep } = useContentBuilder();
  const { mainKeyword, selectedKeywords } = state;

  const [keywordInput, setKeywordInput] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [researchResults, setResearchResults] = useState<KeywordResearchResult | null>(null);
  const [activeMode, setActiveMode] = useState<'basic' | 'enhanced'>('basic');
  const [showEnhanced, setShowEnhanced] = useState(false);

  // Auto-switch to enhanced mode if we have enough keywords
  useEffect(() => {
    if (mainKeyword && selectedKeywords.length >= 3 && !showEnhanced) {
      setShowEnhanced(true);
      setActiveMode('enhanced');
    }
  }, [mainKeyword, selectedKeywords, showEnhanced]);

  const handleKeywordResearch = async () => {
    if (!keywordInput.trim()) {
      toast.error("Please enter a keyword to research");
      return;
    }

    setIsResearching(true);
    try {
      const results = await researchKeyword(keywordInput.trim());
      setResearchResults(results);
      
      if (!mainKeyword) {
        setMainKeyword(keywordInput.trim());
      }
      
      toast.success(`Found ${results.relatedKeywords.length} related keywords and ${results.questions.length} questions`);
    } catch (error) {
      console.error('Keyword research error:', error);
      toast.error("Failed to research keywords. Please try again.");
    } finally {
      setIsResearching(false);
    }
  };

  const handleAddKeyword = (keyword: string) => {
    if (!selectedKeywords.includes(keyword) && keyword !== mainKeyword) {
      addKeyword(keyword);
      toast.success(`Added keyword: ${keyword}`);
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    removeKeyword(keyword);
    toast.success(`Removed keyword: ${keyword}`);
  };

  const handleContinue = () => {
    if (selectedKeywords.length === 0) {
      toast.error("Please select at least one keyword to proceed");
      return;
    }

    markStepCompleted(1);
    navigateToStep(2);
  };

  const handleEnhancedComplete = () => {
    markStepCompleted(1);
    navigateToStep(2);
  };

  // Show enhanced mode if user has enough keywords
  if (showEnhanced && activeMode === 'enhanced') {
    return <EnhancedKeywordSelection onComplete={handleEnhancedComplete} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
              Keyword Research & Selection
            </h2>
            <p className="text-muted-foreground mt-1">
              Find and select the best keywords for your content strategy
            </p>
          </div>
          
          {mainKeyword && selectedKeywords.length >= 3 && (
            <Button
              onClick={() => {
                setShowEnhanced(true);
                setActiveMode('enhanced');
              }}
              className="bg-gradient-to-r from-neon-purple to-neon-blue"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Enable AI Enhancement
            </Button>
          )}
        </div>

        {/* Main keyword input */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Primary Keyword</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your main keyword (e.g., 'content marketing')"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleKeywordResearch()}
                className="bg-glass border-white/10"
              />
              <Button 
                onClick={handleKeywordResearch}
                disabled={isResearching || !keywordInput.trim()}
                className="bg-gradient-to-r from-neon-purple to-neon-blue"
              >
                {isResearching ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Research
              </Button>
            </div>
          </div>

          {mainKeyword && (
            <Alert className="border-neon-purple/20 bg-neon-purple/10">
              <Target className="h-4 w-4" />
              <AlertDescription>
                Primary keyword set: <strong>{mainKeyword}</strong>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Research Results */}
      {researchResults && (
        <Tabs defaultValue="related" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="related">
              Related Keywords ({researchResults.relatedKeywords.length})
            </TabsTrigger>
            <TabsTrigger value="questions">
              Questions ({researchResults.questions.length})
            </TabsTrigger>
            <TabsTrigger value="competitors">
              Competitor Keywords ({researchResults.competitorKeywords.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="related" className="space-y-4">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Related Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {researchResults.relatedKeywords.map((kw, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex-1">
                        <div className="font-medium">{kw.keyword}</div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>Volume: {kw.searchVolume?.toLocaleString() || 'N/A'}</span>
                          <span>Difficulty: {kw.difficulty || 'N/A'}</span>
                          <span>CPC: {kw.cpc || 'N/A'}</span>
                          <Badge variant="outline" className="bg-glass">
                            {kw.intent}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddKeyword(kw.keyword)}
                        disabled={selectedKeywords.includes(kw.keyword) || kw.keyword === mainKeyword}
                        className="bg-gradient-to-r from-neon-purple to-neon-blue"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Related Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {researchResults.questions.map((question, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span className="flex-1">{question}</span>
                      <Button
                        size="sm"
                        onClick={() => handleAddKeyword(question)}
                        disabled={selectedKeywords.includes(question)}
                        className="bg-gradient-to-r from-neon-purple to-neon-blue"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competitors" className="space-y-4">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Competitor Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {researchResults.competitorKeywords.map((keyword, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span className="flex-1">{keyword}</span>
                      <Button
                        size="sm"
                        onClick={() => handleAddKeyword(keyword)}
                        disabled={selectedKeywords.includes(keyword)}
                        className="bg-gradient-to-r from-neon-purple to-neon-blue"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* SERP Keyword Suggestions */}
      <SerpKeywordSuggestions
        onKeywordSelect={setMainKeyword}
        onRelatedKeywordsSelect={(keywords) => {
          keywords.forEach(kw => handleAddKeyword(kw));
        }}
      />

      {/* Selected Keywords */}
      {selectedKeywords.length > 0 && (
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Selected Keywords ({selectedKeywords.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedKeywords.map((keyword, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon-purple/30 px-3 py-1"
                >
                  {keyword}
                  <button
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="ml-2 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhancement suggestion */}
      {mainKeyword && selectedKeywords.length >= 3 && !showEnhanced && (
        <Alert className="border-yellow-500/20 bg-yellow-500/10">
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            <strong>AI Enhancement Available!</strong> You have enough keywords to enable advanced clustering and intent analysis.
            <Button
              size="sm"
              className="ml-2 bg-gradient-to-r from-neon-purple to-neon-blue"
              onClick={() => {
                setShowEnhanced(true);
                setActiveMode('enhanced');
              }}
            >
              Enable Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={selectedKeywords.length === 0}
          className="bg-gradient-to-r from-neon-purple to-neon-blue"
        >
          Continue to Content Structure
        </Button>
      </div>
    </div>
  );
};
