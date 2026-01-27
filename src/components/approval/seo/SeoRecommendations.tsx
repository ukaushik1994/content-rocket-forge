
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, BarChart3, Activity, AlignLeft } from 'lucide-react';
import { KeywordsList } from './KeywordsList';
import { SeoTips } from './SeoTips';
import { motion } from 'framer-motion';

interface SeoRecommendationsProps {
  content: ContentItemType;
}

export const SeoRecommendations: React.FC<SeoRecommendationsProps> = ({ content }) => {
  // Calculate dummy SEO score
  const seoScore = content.seo_score || calculateSeoScore(content);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.1,
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };
  
  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-5"
        variants={itemVariants}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-neon-purple/20 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-neon-purple" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white/90">SEO Recommendations</h2>
            <p className="text-white/60 mt-1">
              Optimize your content for search engines with these data-driven insights.
            </p>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4" 
        variants={itemVariants}
      >
        {/* SEO Score Card */}
        <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-xl overflow-hidden">
          <CardHeader className="pb-2 border-b border-white/10">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-neon-purple" />
              <span className="text-white/80">SEO Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative mb-4">
                <div className="text-4xl font-bold mb-2 text-center text-white">
                  {seoScore}%
                </div>
                <svg className="w-24 h-24 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <circle
                    className="stroke-current text-gray-700/30"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="transparent"
                    r="36"
                    cx="44"
                    cy="44"
                  />
                  <circle
                    className="stroke-current text-neon-purple"
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="36"
                    cx="44"
                    cy="44"
                    strokeDasharray={`${36 * 2 * Math.PI}`}
                    strokeDashoffset={`${36 * 2 * Math.PI * (1 - seoScore / 100)}`}
                    transform="rotate(-90 44 44)"
                  />
                </svg>
              </div>
              <div className="text-xs text-white/60 mt-1 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                {getSeoScoreLabel(seoScore)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Content Length */}
        <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-xl overflow-hidden">
          <CardHeader className="pb-2 border-b border-white/10">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-neon-blue" />
              <span className="text-white/80">Content Length</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-4xl font-bold mb-4 text-white">
                {getWordCount(content.content)} <span className="text-lg text-white/70">words</span>
              </div>
              <Progress 
                value={getContentLengthScore(content.content)} 
                className="h-2 w-full bg-white/10" 
              />
              <div className="text-xs text-white/60 mt-3 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                {getContentLengthLabel(content.content)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Readability */}
        <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-xl overflow-hidden">
          <CardHeader className="pb-2 border-b border-white/10">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-400" />
              <span className="text-white/80">Readability</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-4xl font-bold mb-4 text-white">
                Good
              </div>
              <Progress value={75} className="h-2 w-full bg-white/10" />
              <div className="text-xs text-white/60 mt-3 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                Easy to read for most audiences
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Keywords Analysis */}
      <motion.div variants={itemVariants}>
        <KeywordsList content={content} />
      </motion.div>
      
      {/* SEO Tips */}
      <motion.div variants={itemVariants}>
        <SeoTips content={content} />
      </motion.div>
    </motion.div>
  );
};

// Helper functions for SEO analysis

function calculateSeoScore(content: ContentItemType): number {
  let score = 0;
  
  const wordCount = getWordCount(content.content);
  const hasContent = content.content && content.content.length > 0;
  const hasKeywords = content.keywords && content.keywords.length > 0;
  const hasTitle = content.title && content.title.length > 0;
  const hasMetaDescription = content.meta_description && content.meta_description.length > 0;
  
  // Content presence and length (max 30 points)
  if (hasContent) {
    score += 10;
    if (wordCount > 300) score += 5;
    if (wordCount > 600) score += 5;
    if (wordCount > 1000) score += 5;
    if (wordCount > 1500) score += 5;
  }
  
  // Title optimization (max 20 points)
  if (hasTitle) {
    score += 10;
    const titleLength = content.title.length;
    if (titleLength >= 30 && titleLength <= 60) score += 10;
    else if (titleLength > 0 && titleLength < 30) score += 5;
  }
  
  // Meta description (max 15 points)
  if (hasMetaDescription) {
    score += 8;
    const descLength = content.meta_description?.length || 0;
    if (descLength >= 120 && descLength <= 160) score += 7;
    else if (descLength > 0) score += 3;
  }
  
  // Keywords (max 20 points)
  if (hasKeywords) {
    score += 10;
    if (content.keywords.length >= 3) score += 5;
    if (content.keywords.length >= 5) score += 5;
  }
  
  // Keyword density in content (max 15 points)
  if (hasContent && hasKeywords) {
    const primaryKeyword = content.keywords[0]?.toLowerCase() || '';
    const contentLower = content.content.toLowerCase();
    const keywordCount = (contentLower.match(new RegExp(primaryKeyword, 'gi')) || []).length;
    const density = (keywordCount / wordCount) * 100;
    
    if (density >= 0.5 && density <= 2.5) score += 15; // Ideal density
    else if (density > 0 && density < 0.5) score += 8; // Too low
    else if (density > 2.5) score += 5; // Over-optimized
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
