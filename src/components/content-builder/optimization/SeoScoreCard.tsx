
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, BookOpen, KeyRound, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export interface SeoScoreCardProps {
  seoScore: number;
  scores: {
    keywordUsage: number;
    contentLength: number;
    readability: number;
  };
  getScoreColor: (score: number) => string;
}

export const SeoScoreCard = ({ 
  seoScore, 
  scores, 
  getScoreColor 
}: SeoScoreCardProps) => {
  
  // Get appropriate label based on score
  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };
  
  // Calculate score for circular progress
  const calculateStrokeDashoffset = (score: number) => {
    const circumference = 2 * Math.PI * 59; // r = 60 (circle radius) - 1 (half of stroke-width)
    return circumference - (score / 100) * circumference;
  };
  
  return (
    <Card className="shadow-xl bg-gradient-to-br from-background to-purple-950/5 border border-purple-500/20 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          SEO Score
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-4 h-[calc(100%-60px)]">
        {seoScore > 0 ? (
          <>
            <div className="relative w-48 h-48 mb-6">
              <svg className="w-full h-full" viewBox="0 0 120 120">
                {/* Track Circle */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="59" 
                  fill="none" 
                  stroke="rgba(148, 163, 184, 0.2)" 
                  strokeWidth="2"
                />
                
                {/* Progress Circle */}
                <motion.circle 
                  cx="60" 
                  cy="60" 
                  r="59" 
                  fill="none" 
                  stroke={`url(#gradient-${seoScore >= 70 ? 'good' : seoScore >= 50 ? 'fair' : 'poor'})`}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 59}
                  strokeDashoffset={2 * Math.PI * 59}
                  transform="rotate(-90 60 60)"
                  initial={{ strokeDashoffset: 2 * Math.PI * 59 }}
                  animate={{ strokeDashoffset: calculateStrokeDashoffset(seoScore) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                
                {/* Gradient Definitions */}
                <defs>
                  <linearGradient id="gradient-good" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                  <linearGradient id="gradient-fair" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                  <linearGradient id="gradient-poor" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
                
                {/* Score Text */}
                <text 
                  x="60" 
                  y="50" 
                  textAnchor="middle" 
                  fontSize="28" 
                  fontWeight="bold" 
                  fill="currentColor"
                >
                  {seoScore}
                </text>
                <text 
                  x="60" 
                  y="70" 
                  textAnchor="middle" 
                  fontSize="12" 
                  fill="currentColor"
                  opacity="0.7"
                >
                  {getScoreLabel(seoScore)}
                </text>
              </svg>
            </div>
            
            <div className="w-full space-y-3">
              <div>
                <div className="flex justify-between mb-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-blue-500" />
                    <span>Keyword Usage</span>
                  </div>
                  <span className={scores.keywordUsage >= 70 ? 'text-green-500' : scores.keywordUsage >= 50 ? 'text-yellow-500' : 'text-red-500'}>
                    {scores.keywordUsage}/100
                  </span>
                </div>
                <div className="h-1.5 w-full bg-blue-500/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-500"
                    style={{ width: `${scores.keywordUsage}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${scores.keywordUsage}%` }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-green-500" />
                    <span>Content Length</span>
                  </div>
                  <span className={scores.contentLength >= 70 ? 'text-green-500' : scores.contentLength >= 50 ? 'text-yellow-500' : 'text-red-500'}>
                    {scores.contentLength}/100
                  </span>
                </div>
                <div className="h-1.5 w-full bg-green-500/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-green-500"
                    style={{ width: `${scores.contentLength}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${scores.contentLength}%` }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                    <span>Readability</span>
                  </div>
                  <span className={scores.readability >= 70 ? 'text-green-500' : scores.readability >= 50 ? 'text-yellow-500' : 'text-red-500'}>
                    {scores.readability}/100
                  </span>
                </div>
                <div className="h-1.5 w-full bg-purple-500/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-purple-500"
                    style={{ width: `${scores.readability}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${scores.readability}%` }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
              <BarChart2 className="h-10 w-10 text-blue-500/70" />
            </div>
            <p className="text-muted-foreground">Run analysis to see your SEO score</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
