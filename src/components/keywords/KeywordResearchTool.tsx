
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { KeywordResearchResult, researchKeyword } from '@/services/keywordResearchService';
import { BarChart, LineChart } from '@/components/ui/chart';
import { Loader2, Search, ArrowRight } from 'lucide-react';

interface KeywordResearchToolProps {
  onUseKeyword?: (keyword: string) => void;
}

export function KeywordResearchTool({ onUseKeyword }: KeywordResearchToolProps) {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [researchResult, setResearchResult] = useState<KeywordResearchResult | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [animateTab, setAnimateTab] = useState(false);

  const handleTabChange = (value: string) => {
    setAnimateTab(true);
    setActiveTab(value);
    setTimeout(() => setAnimateTab(false), 300);
  };

  const handleResearch = async () => {
    if (!keyword.trim()) {
      toast.error('Please enter a keyword to research');
      return;
    }

    setLoading(true);
    try {
      const result = await researchKeyword(keyword.trim());
      setResearchResult(result);
      toast.success(`Research completed for: ${keyword}`);
    } catch (error) {
      console.error('Keyword research error:', error);
      toast.error('Failed to research keyword. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = researchResult?.trendData?.map(item => ({
    name: item.period,
    value: item.volume
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter keyword to research..."
            className="pl-9 bg-glass border-white/10 focus:border-white/30 transition-colors"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
          />
        </div>
        <Button 
          onClick={handleResearch}
          disabled={loading}
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300 hover:shadow-neon"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Researching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Research Keyword
            </>
          )}
        </Button>
      </div>

      {researchResult && (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="bg-secondary/30">
            <TabsTrigger value="overview" className="transition-all duration-200 hover:bg-secondary/70">Overview</TabsTrigger>
            <TabsTrigger value="related" className="transition-all duration-200 hover:bg-secondary/70">Related Keywords</TabsTrigger>
            <TabsTrigger value="questions" className="transition-all duration-200 hover:bg-secondary/70">People Also Ask</TabsTrigger>
            <TabsTrigger value="competitors" className="transition-all duration-200 hover:bg-secondary/70">Competitor Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className={`mt-4 space-y-4 ${animateTab ? 'animate-fade-in' : ''}`}>
            <Card className="glass-panel transition-all duration-300 hover:shadow-neon-strong">
              <CardContent className="pt-6">
                <h3 className="text-xl font-medium mb-4">Keyword Trend: {researchResult.mainKeyword}</h3>
                <div className="h-80">
                  <LineChart 
                    data={chartData} 
                    index="name"
                    categories={["value"]}
                    colors={["#9945FF"]}
                    valueFormatter={(value) => `${value.toLocaleString()} searches`}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass-panel hover:shadow-neon transition-all duration-300">
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium text-muted-foreground">Search Volume</h3>
                  <p className="text-2xl font-bold">{researchResult.relatedKeywords[0]?.searchVolume?.toLocaleString() || 'N/A'}</p>
                </CardContent>
              </Card>
              
              <Card className="glass-panel hover:shadow-neon transition-all duration-300">
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium text-muted-foreground">Difficulty</h3>
                  <p className="text-2xl font-bold">{researchResult.relatedKeywords[0]?.difficulty || 'N/A'}/100</p>
                </CardContent>
              </Card>
              
              <Card className="glass-panel hover:shadow-neon transition-all duration-300">
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium text-muted-foreground">CPC</h3>
                  <p className="text-2xl font-bold">{researchResult.relatedKeywords[0]?.cpc || 'N/A'}</p>
                </CardContent>
              </Card>
              
              <Card className="glass-panel hover:shadow-neon transition-all duration-300">
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium text-muted-foreground">Intent</h3>
                  <p className="text-2xl font-bold">{researchResult.relatedKeywords[0]?.intent || 'N/A'}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="related" className={`mt-4 ${animateTab ? 'animate-fade-in' : ''}`}>
            <Card className="glass-panel">
              <CardContent className="pt-6">
                <h3 className="text-xl font-medium mb-4">Related Keywords</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left font-medium py-2 px-4">Keyword</th>
                        <th className="text-left font-medium py-2 px-4">Volume</th>
                        <th className="text-left font-medium py-2 px-4">Difficulty</th>
                        <th className="text-left font-medium py-2 px-4">CPC</th>
                        <th className="text-left font-medium py-2 px-4">Intent</th>
                        <th className="text-left font-medium py-2 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {researchResult.relatedKeywords.map((keyword, index) => (
                        <tr key={index} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                          <td className="py-2 px-4">{keyword.keyword}</td>
                          <td className="py-2 px-4">{keyword.searchVolume?.toLocaleString() || 'N/A'}</td>
                          <td className="py-2 px-4">{keyword.difficulty || 'N/A'}</td>
                          <td className="py-2 px-4">{keyword.cpc || 'N/A'}</td>
                          <td className="py-2 px-4">{keyword.intent || 'N/A'}</td>
                          <td className="py-2 px-4">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-primary/10 transition-colors"
                              onClick={() => onUseKeyword && onUseKeyword(keyword.keyword)}
                            >
                              <ArrowRight className="h-3 w-3" />
                              <span className="ml-1">Use</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="questions" className={`mt-4 ${animateTab ? 'animate-fade-in' : ''}`}>
            <Card className="glass-panel">
              <CardContent className="pt-6">
                <h3 className="text-xl font-medium mb-4">People Also Ask</h3>
                <div className="space-y-3">
                  {researchResult.questions.map((question, index) => (
                    <div 
                      key={index} 
                      className="p-3 rounded-md border border-border hover:border-primary/30 transition-all duration-200 hover:translate-x-1 cursor-pointer"
                      onClick={() => onUseKeyword && onUseKeyword(question)}
                    >
                      <p className="flex items-start gap-2">
                        <span className="text-neon-purple font-medium">Q:</span>
                        <span>{question}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="competitors" className={`mt-4 ${animateTab ? 'animate-fade-in' : ''}`}>
            <Card className="glass-panel">
              <CardContent className="pt-6">
                <h3 className="text-xl font-medium mb-4">Competitor Keywords</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {researchResult.competitorKeywords.map((keyword, index) => (
                    <Card key={index} className="bg-background/50 border border-border hover:border-primary/30 hover:shadow-neon transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span>{keyword}</span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 hover:bg-primary/10 hover:border-primary/30 transition-colors"
                            onClick={() => onUseKeyword && onUseKeyword(keyword)}
                          >
                            <Search className="h-3 w-3 mr-1" />
                            Use
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
