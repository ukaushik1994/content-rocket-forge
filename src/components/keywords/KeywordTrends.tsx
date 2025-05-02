
import React, { useState } from 'react';
import { LineChart } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ArrowUpRight, DownloadCloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface KeywordTrendsProps {
  onUseKeyword?: (keyword: string) => void;
}

export function KeywordTrends({ onUseKeyword }: KeywordTrendsProps) {
  const [timeRange, setTimeRange] = useState('6m');
  const [isExporting, setIsExporting] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  
  const trendData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 6000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 8000 },
    { name: 'May', value: 9000 },
    { name: 'Jun', value: 11000 },
  ];
  
  const compareData = [
    { name: 'Jan', value: 4000, competitor: 3200 },
    { name: 'Feb', value: 6000, competitor: 5500 },
    { name: 'Mar', value: 5000, competitor: 4800 },
    { name: 'Apr', value: 8000, competitor: 7200 },
    { name: 'May', value: 9000, competitor: 9500 },
    { name: 'Jun', value: 11000, competitor: 10200 },
  ];
  
  const topTrendingKeywords = [
    { keyword: "content marketing tools", growth: "+127%" },
    { keyword: "AI content generator", growth: "+95%" },
    { keyword: "SEO software comparison", growth: "+78%" },
    { keyword: "blog writing tools free", growth: "+64%" },
    { keyword: "content optimization platform", growth: "+52%" }
  ];

  const handleExportData = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast.success("Data exported successfully!", {
        description: "Your trend data has been exported."
      });
    }, 1500);
  };

  const handleCompareCompetitors = () => {
    setIsComparing(prevState => !prevState);
    if (!isComparing) {
      toast.info("Comparing with competitors", {
        description: "Now showing competitor data on the graph"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px] bg-glass border-white/10 hover:border-white/20 transition-colors">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">Last Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={`hover:bg-accent/50 transition-colors ${isComparing ? 'bg-accent/40 border-primary/40' : ''}`}
            onClick={handleCompareCompetitors}
          >
            Compare to Competitors
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="hover:bg-accent/50 transition-colors"
            onClick={handleExportData}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <DownloadCloud className="h-4 w-4 mr-1" />
                Export Data
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        <div className="lg:col-span-2">
          <Card className="bg-background/50 border border-white/10 hover:shadow-neon transition-all duration-300">
            <CardContent className="pt-6">
              <h3 className="text-xl font-medium mb-4">Keyword Volume Trends</h3>
              <div className="h-80">
                <LineChart 
                  data={isComparing ? compareData : trendData}
                  categories={isComparing ? ["value", "competitor"] : ["value"]}
                  index="name"
                  colors={isComparing ? ["#9945FF", "#06b6d4"] : ["#9945FF"]}
                  valueFormatter={(value) => `${value.toLocaleString()} searches`}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="bg-background/50 border border-white/10 hover:shadow-neon transition-all duration-300">
            <CardContent className="pt-6">
              <h3 className="text-xl font-medium mb-4">Trending Keywords</h3>
              <div className="space-y-4">
                {topTrendingKeywords.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-glass rounded-md border border-white/10 hover:border-white/30 transition-all duration-200 hover:translate-x-1 cursor-pointer"
                    onClick={() => onUseKeyword && onUseKeyword(item.keyword)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-medium bg-background/50 w-6 h-6 rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-medium">{item.keyword}</span>
                    </div>
                    <div className="flex items-center text-emerald-500">
                      {item.growth}
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="ghost" 
                className="w-full mt-4 text-sm hover:bg-primary/10 transition-colors"
                onClick={() => toast.info("This feature will be available soon")}
              >
                <Search className="h-3 w-3 mr-1" />
                Research All Trending Keywords
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
