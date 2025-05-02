
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { analyzeContent } from '@/services/serpApiService';
import { 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Sparkles,
  RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';

export const OptimizationStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { content, mainKeyword, selectedKeywords, seoScore } = state;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywordUsage, setKeywordUsage] = useState<{ keyword: string; count: number; density: string }[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  
  useEffect(() => {
    // Run initial analysis if we have content but no SEO score
    if (content && content.length > 300 && seoScore === 0) {
      runSeoAnalysis();
    }
    
    // Calculate keyword usage from content
    calculateKeywordUsage();
    
    // Mark as complete if we have a good SEO score
    if (seoScore >= 70) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    }
  }, [content, seoScore]);
  
  const calculateKeywordUsage = () => {
    if (!content || !mainKeyword) return;
    
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const usageData = [mainKeyword, ...selectedKeywords.filter(k => k !== mainKeyword)]
      .map(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = content.match(regex) || [];
        const count = matches.length;
        const density = ((count / wordCount) * 100).toFixed(1);
        
        return { keyword, count, density: `${density}%` };
      });
    
    setKeywordUsage(usageData);
  };
  
  const runSeoAnalysis = async () => {
    if (!content || !mainKeyword) {
      toast.error('Content or keywords are missing');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const data = await analyzeContent(content, [mainKeyword, ...selectedKeywords]);
      
      // Set recommendations
      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
      }
      
      // Calculate a score based on several factors
      const keywordUsageScore = calculateKeywordUsageScore();
      const contentLengthScore = calculateContentLengthScore();
      const readabilityScore = 75; // Placeholder - would be from actual analysis
      
      // Weighted average
      const calculatedScore = Math.round(
        (keywordUsageScore * 0.4) + 
        (contentLengthScore * 0.3) + 
        (readabilityScore * 0.3)
      );
      
      dispatch({ type: 'SET_SEO_SCORE', payload: calculatedScore });
      toast.success('SEO analysis completed');
      
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast.error('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const calculateKeywordUsageScore = () => {
    // Basic scoring based on keyword presence and density
    const mainKeywordUsage = keywordUsage.find(k => k.keyword === mainKeyword);
    if (!mainKeywordUsage) return 50;
    
    const density = parseFloat(mainKeywordUsage.density);
    
    // Optimal density is around 1-3%
    if (density < 0.5) return 50;
    if (density >= 0.5 && density < 1) return 70;
    if (density >= 1 && density <= 3) return 100;
    if (density > 3 && density <= 5) return 75;
    return 50; // Over 5% is keyword stuffing
  };
  
  const calculateContentLengthScore = () => {
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    
    // Score based on content length
    if (wordCount < 300) return 30;
    if (wordCount >= 300 && wordCount < 600) return 50;
    if (wordCount >= 600 && wordCount < 1200) return 80;
    if (wordCount >= 1200) return 100;
    return 0;
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  const getRecommendationIcon = (index: number) => {
    // Use different icons for different recommendations
    switch (index % 3) {
      case 0:
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 1:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-blue-500" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">SEO Optimization</h3>
          <p className="text-sm text-muted-foreground">
            Analyze and optimize your content for search engines.
          </p>
        </div>
        
        <Button
          onClick={runSeoAnalysis}
          disabled={isAnalyzing || !content || content.length < 300}
          className={seoScore > 0 ? 'gap-2' : 'bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple gap-2'}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              {seoScore > 0 ? 'Re-analyze' : 'Analyze Content'}
            </>
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Optimization Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations.length > 0 ? (
              <ul className="space-y-3">
                {recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    {getRecommendationIcon(index)}
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>
                  {isAnalyzing 
                    ? 'Analyzing content...' 
                    : 'Run the analysis to get optimization recommendations'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">SEO Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center p-4">
              <div className="relative h-32 w-32">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle className="stroke-gray-200" r="45" cx="50" cy="50" strokeWidth="10" fill="none" />
                  <circle 
                    className={`${getScoreColor(seoScore)} transition-all duration-1000 ease-in-out`}
                    r="45" 
                    cx="50" 
                    cy="50" 
                    stroke-width="10" 
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45 * (seoScore / 100)} ${2 * Math.PI * 45}`}
                    strokeDashoffset={2 * Math.PI * 45 * 0.25}
                    style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                  />
                </svg>
                <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center text-3xl font-bold">
                  {seoScore}
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                {seoScore >= 90 
                  ? 'Excellent! Your content is well-optimized.'
                  : seoScore >= 70
                  ? 'Good! Minor tweaks can improve your score.'
                  : seoScore >= 50
                  ? 'Average. Follow recommendations to improve.'
                  : 'Needs improvement. Review recommendations carefully.'}
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-xs mb-1 font-medium">Keyword Usage</div>
                <Progress value={calculateKeywordUsageScore()} className="h-1.5" />
              </div>
              <div>
                <div className="text-xs mb-1 font-medium">Content Length</div>
                <Progress value={calculateContentLengthScore()} className="h-1.5" />
              </div>
              <div>
                <div className="text-xs mb-1 font-medium">Readability</div>
                <Progress value={75} className="h-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Keyword Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {keywordUsage.map((item, index) => (
              <div key={index} className="border rounded-md p-3 flex justify-between items-center">
                <Badge className={item.keyword === mainKeyword ? 'bg-primary/10 text-primary border-primary/30' : 'bg-secondary'}>
                  {item.keyword}
                </Badge>
                <div className="text-sm">
                  <span className="text-muted-foreground">Count: </span>
                  <span className="font-medium">{item.count}</span>
                  <span className="text-muted-foreground ml-2">Density: </span>
                  <span className="font-medium">{item.density}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
