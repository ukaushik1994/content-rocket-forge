
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Wand } from 'lucide-react';
import { KeywordsList } from './KeywordsList';
import { SeoTips } from './SeoTips';

interface SeoRecommendationsProps {
  content: ContentItemType;
}

export const SeoRecommendations: React.FC<SeoRecommendationsProps> = ({ content }) => {
  // Calculate dummy SEO score
  const seoScore = content.seo_score || calculateSeoScore(content);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">SEO Recommendations</h2>
        <p className="text-muted-foreground">
          Optimize your content for search engines with these recommendations.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SEO Score Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">SEO Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-24">
              <div className="text-3xl font-bold mb-2">
                {seoScore}%
              </div>
              <Progress value={seoScore} className="h-2 w-full" />
              <div className="text-xs text-muted-foreground mt-2">
                {getSeoScoreLabel(seoScore)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Content Length */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Content Length</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-24">
              <div className="text-3xl font-bold mb-2">
                {getWordCount(content.content)} words
              </div>
              <Progress 
                value={getContentLengthScore(content.content)} 
                className="h-2 w-full" 
              />
              <div className="text-xs text-muted-foreground mt-2">
                {getContentLengthLabel(content.content)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Readability */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Readability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-24">
              <div className="text-3xl font-bold mb-2">
                Good
              </div>
              <Progress value={75} className="h-2 w-full" />
              <div className="text-xs text-muted-foreground mt-2">
                Easy to read for most audiences
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Keywords Analysis */}
      <KeywordsList content={content} />
      
      {/* SEO Tips */}
      <SeoTips content={content} />
    </div>
  );
};

// Helper functions for SEO analysis

function calculateSeoScore(content: ContentItemType): number {
  // Dummy calculation, would be more sophisticated in a real app
  let score = 50;
  
  // Add points for having content
  if (content.content && content.content.length > 0) {
    score += 10;
    
    // Add points for longer content
    const wordCount = getWordCount(content.content);
    if (wordCount > 300) score += 5;
    if (wordCount > 600) score += 5;
    if (wordCount > 1000) score += 5;
  }
  
  // Add points for having keywords
  if (content.keywords && content.keywords.length > 0) {
    score += 10;
    if (content.keywords.length >= 3) score += 5;
  }
  
  // Add points for having a title
  if (content.title && content.title.length > 0) {
    score += 10;
  }
  
  return Math.min(score, 100);
}

function getWordCount(text: string = ''): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function getContentLengthScore(text: string = ''): number {
  const wordCount = getWordCount(text);
  // 1500 words is considered ideal (100%)
  return Math.min(Math.round((wordCount / 1500) * 100), 100);
}

function getContentLengthLabel(text: string = ''): string {
  const wordCount = getWordCount(text);
  
  if (wordCount < 300) return 'Too short - add more content';
  if (wordCount < 600) return 'Could be longer for better SEO';
  if (wordCount < 1000) return 'Good length';
  return 'Excellent length';
}

function getSeoScoreLabel(score: number): string {
  if (score < 40) return 'Needs improvement';
  if (score < 60) return 'Average';
  if (score < 80) return 'Good';
  return 'Excellent';
}
