
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { KeywordResearchResult, researchKeyword } from '@/services/keywordResearchService';
import { BarChart, LineChart } from '@/components/ui/chart';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export function KeywordResearchTool() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [researchResult, setResearchResult] = useState<KeywordResearchResult | null>(null);

  const handleResearch = async () => {
    if (!keyword.trim()) {
      toast.error('Please enter a keyword to research');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Researching keyword:', keyword);
      const result = await researchKeyword(keyword.trim());
      setResearchResult(result);
      toast.success(`Research completed for: ${keyword}`);
    } catch (error) {
      console.error('Keyword research error:', error);
      setError('Failed to research keyword. Please try again.');
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
            className="pl-9 bg-glass border-white/10"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
            disabled={loading}
          />
        </div>
        <Button 
          onClick={handleResearch}
          disabled={loading || !keyword.trim()}
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-[300px] w-full rounded-md" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-md" />
            ))}
          </div>
        </div>
      )}

      {researchResult && !loading && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-secondary/30">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="related">Related Keywords</TabsTrigger>
            <TabsTrigger value="questions">People Also Ask</TabsTrigger>
            <TabsTrigger value="competitors">Competitor Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4 space-y-4">
            <Card className="glass-panel">
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
              <Card className="glass-panel">
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium text-muted-foreground">Search Volume</h3>
                  <p className="text-2xl font-bold">{researchResult.relatedKeywords[0]?.searchVolume?.toLocaleString() || 'N/A'}</p>
                </CardContent>
              </Card>
              
              <Card className="glass-panel">
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium text-muted-foreground">Difficulty</h3>
                  <p className="text-2xl font-bold">{researchResult.relatedKeywords[0]?.difficulty || 'N/A'}/100</p>
                </CardContent>
              </Card>
              
              <Card className="glass-panel">
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium text-muted-foreground">CPC</h3>
                  <p className="text-2xl font-bold">{researchResult.relatedKeywords[0]?.cpc || 'N/A'}</p>
                </CardContent>
              </Card>
              
              <Card className="glass-panel">
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium text-muted-foreground">Intent</h3>
                  <p className="text-2xl font-bold">{researchResult.relatedKeywords[0]?.intent || 'N/A'}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="related" className="mt-4">
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
                      </tr>
                    </thead>
                    <tbody>
                      {researchResult.relatedKeywords.map((keyword, index) => (
                        <tr key={index} className="border-b border-border/50 hover:bg-background/50">
                          <td className="py-2 px-4">{keyword.keyword}</td>
                          <td className="py-2 px-4">{keyword.searchVolume?.toLocaleString() || 'N/A'}</td>
                          <td className="py-2 px-4">{keyword.difficulty || 'N/A'}</td>
                          <td className="py-2 px-4">{keyword.cpc || 'N/A'}</td>
                          <td className="py-2 px-4">{keyword.intent || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="questions" className="mt-4">
            <Card className="glass-panel">
              <CardContent className="pt-6">
                <h3 className="text-xl font-medium mb-4">People Also Ask</h3>
                <div className="space-y-3">
                  {researchResult.questions.map((question, index) => (
                    <div key={index} className="p-3 rounded-md border border-border">
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
          
          <TabsContent value="competitors" className="mt-4">
            <Card className="glass-panel">
              <CardContent className="pt-6">
                <h3 className="text-xl font-medium mb-4">Competitor Keywords</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {researchResult.competitorKeywords.map((keyword, index) => (
                    <Card key={index} className="bg-background/50 border border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span>{keyword}</span>
                          <Button variant="outline" size="sm" className="h-7">
                            <Search className="h-3 w-3 mr-1" />
                            Research
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
