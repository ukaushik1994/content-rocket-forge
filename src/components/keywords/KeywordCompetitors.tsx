
import React, { useState } from 'react';
import { BarChart } from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Link, Globe } from 'lucide-react';
import { toast } from 'sonner';

export function KeywordCompetitors() {
  const [searchValue, setSearchValue] = useState('');
  
  const rankingGapData = [
    { keyword: "content marketing", you: 18, competitor: 3 },
    { keyword: "SEO tools", you: 24, competitor: 5 },
    { keyword: "keyword research", you: 12, competitor: 2 },
    { keyword: "blog writing", you: 9, competitor: 4 },
    { keyword: "content strategy", you: 15, competitor: 7 }
  ];

  const competitorsData = [
    { competitor: "Ahrefs", overlapScore: 68, uniqueKeywords: 423, commonKeywords: 156 },
    { competitor: "Semrush", overlapScore: 59, uniqueKeywords: 389, commonKeywords: 132 },
    { competitor: "Moz", overlapScore: 52, uniqueKeywords: 276, commonKeywords: 98 },
    { competitor: "Ubersuggest", overlapScore: 47, uniqueKeywords: 215, commonKeywords: 89 }
  ];
  
  const chartData = [
    { name: "Content Marketing", you: 18, competitor: 3 },
    { name: "SEO Tools", you: 24, competitor: 5 },
    { name: "Keyword Research", you: 12, competitor: 2 },
    { name: "Blog Writing", you: 9, competitor: 4 },
    { name: "Content Strategy", you: 15, competitor: 7 }
  ];
  
  const handleAnalyze = () => {
    if (!searchValue) {
      toast.error("Please enter a competitor domain");
      return;
    }
    
    toast.success(`Analyzing competitor: ${searchValue}`, {
      description: "Analysis will be ready in a few moments."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter competitor domain..."
            className="pl-9 bg-glass border-white/10"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleAnalyze}
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
        >
          <Search className="mr-2 h-4 w-4" />
          Analyze Competitor
        </Button>
      </div>
      
      <Tabs defaultValue="gaps">
        <TabsList className="bg-secondary/30">
          <TabsTrigger value="gaps">Ranking Gaps</TabsTrigger>
          <TabsTrigger value="overlap">Keyword Overlap</TabsTrigger>
          <TabsTrigger value="comparison">Competitive Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gaps" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-background/50 border border-white/10">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-medium mb-4">Top Ranking Gap Opportunities</h3>
                  <div className="h-80">
                    <BarChart 
                      data={chartData}
                      categories={["you", "competitor"]}
                      index="name"
                      colors={["#9945FF", "#06b6d4"]}
                      valueFormatter={(value) => `Rank #${value}`}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="bg-background/50 border border-white/10">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-medium mb-4">Opportunities</h3>
                  <div className="space-y-3">
                    {rankingGapData.map((item, index) => (
                      <div key={index} className="p-3 bg-glass rounded-md border border-white/10">
                        <p className="font-medium mb-1">{item.keyword}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Your rank: #{item.you}</span>
                          <span className="text-muted-foreground">Competitor: #{item.competitor}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="overlap" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-background/50 border border-white/10">
              <CardContent className="pt-6">
                <h3 className="text-xl font-medium mb-4">Keyword Overlap Analysis</h3>
                <div className="space-y-4">
                  {competitorsData.map((item, index) => (
                    <div key={index} className="p-4 bg-glass rounded-md border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-blue-400" />
                          <span className="font-medium">{item.competitor}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7">
                          <Link className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="p-2 bg-background/30 rounded text-center">
                          <p className="text-xs text-muted-foreground">Overlap</p>
                          <p className="font-medium">{item.overlapScore}%</p>
                        </div>
                        <div className="p-2 bg-background/30 rounded text-center">
                          <p className="text-xs text-muted-foreground">Unique</p>
                          <p className="font-medium">{item.uniqueKeywords}</p>
                        </div>
                        <div className="p-2 bg-background/30 rounded text-center">
                          <p className="text-xs text-muted-foreground">Common</p>
                          <p className="font-medium">{item.commonKeywords}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background/50 border border-white/10">
              <CardContent className="pt-6">
                <h3 className="text-xl font-medium mb-4">Common Ranking Keywords</h3>
                <div className="space-y-3">
                  {["content marketing strategy", "SEO tools comparison", "keyword research tips", "content optimization", "blog post ideas"].map((keyword, index) => (
                    <div key={index} className="p-3 bg-glass rounded-md border border-white/10 flex justify-between items-center">
                      <span>{keyword}</span>
                      <Button variant="ghost" size="sm" className="h-7">
                        <Search className="h-3 w-3 mr-1" />
                        Analyze
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="comparison" className="mt-4">
          <Card className="bg-background/50 border border-white/10">
            <CardContent className="pt-6">
              <h3 className="text-xl font-medium mb-4">Competitive Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium py-2 px-4">Metric</th>
                      <th className="text-left font-medium py-2 px-4">Your Site</th>
                      <th className="text-left font-medium py-2 px-4">Competitor</th>
                      <th className="text-left font-medium py-2 px-4">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { metric: "Domain Authority", yours: 45, competitor: 52, difference: "-7" },
                      { metric: "Ranking Keywords", yours: 1245, competitor: 1876, difference: "-631" },
                      { metric: "Organic Traffic", yours: "15.2K", competitor: "24.5K", difference: "-9.3K" },
                      { metric: "Backlinks", yours: 856, competitor: 1203, difference: "-347" },
                      { metric: "Top Ranking Position", yours: "Position #3", competitor: "Position #1", difference: "-2" }
                    ].map((item, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-background/50">
                        <td className="py-3 px-4 font-medium">{item.metric}</td>
                        <td className="py-3 px-4">{item.yours}</td>
                        <td className="py-3 px-4">{item.competitor}</td>
                        <td className={`py-3 px-4 ${item.difference.includes('-') ? 'text-red-400' : 'text-green-400'}`}>
                          {item.difference}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
