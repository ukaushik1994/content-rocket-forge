
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle, BookOpen, AlertCircle } from 'lucide-react';

interface ReadabilityCardProps {
  content: string;
}

export function ReadabilityCard({ content }: ReadabilityCardProps) {
  // Simple readability metrics
  const calculateReadabilityMetrics = (text: string) => {
    if (!text) return { 
      score: 0, 
      level: 'No content',
      sentenceCount: 0,
      avgSentenceLength: 0,
      longSentences: 0,
      paragraphCount: 0,
      passiveVoice: false
    };
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    
    const sentenceCount = sentences.length;
    const wordCount = words.length;
    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    
    // Count long sentences (more than 25 words)
    const longSentences = sentences.filter(s => 
      s.split(/\s+/).filter(w => w.length > 0).length > 25
    ).length;
    
    // Simple passive voice detection (contains "was" or "were" followed by a past participle)
    const passiveVoiceRegex = /\b(?:am|are|is|was|were|be|being|been)\s+\w+ed\b/i;
    const passiveVoice = passiveVoiceRegex.test(text);
    
    // Calculate a simple readability score (0-100)
    let score = 0;
    
    // Penalty for very long sentences
    const longSentencePenalty = Math.min(longSentences * 5, 20);
    
    // Penalty for passive voice
    const passiveVoicePenalty = passiveVoice ? 10 : 0;
    
    // Base score based on average sentence length (optimal is 15-20)
    if (avgSentenceLength >= 10 && avgSentenceLength <= 20) {
      score = 100;
    } else if (avgSentenceLength < 10) {
      // Too short sentences
      score = 70 + (avgSentenceLength * 3);
    } else {
      // Too long sentences
      score = 100 - ((avgSentenceLength - 20) * 3);
    }
    
    // Apply penalties
    score = Math.max(0, score - longSentencePenalty - passiveVoicePenalty);
    
    // Determine readability level
    let level = 'Poor';
    if (score >= 90) level = 'Excellent';
    else if (score >= 70) level = 'Good';
    else if (score >= 50) level = 'Average';
    
    return {
      score,
      level,
      sentenceCount,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      longSentences,
      paragraphCount: paragraphs.length,
      passiveVoice
    };
  };
  
  const readability = calculateReadabilityMetrics(content);
  
  // Color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-teal-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-rose-400';
  };
  
  const scoreColor = getScoreColor(readability.score);

  return (
    <Card className="border border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          Readability Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Score */}
          <div className="flex items-center justify-center">
            <div className={`text-2xl font-semibold ${scoreColor}`}>
              {readability.score}/100
            </div>
            <div className="text-sm ml-2 text-muted-foreground">
              {readability.level}
            </div>
          </div>
          
          {/* Metrics */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 border border-white/10 rounded-md p-2">
                <p className="text-xs text-muted-foreground">Sentences</p>
                <p className="font-semibold">{readability.sentenceCount}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-md p-2">
                <p className="text-xs text-muted-foreground">Avg. Sentence Length</p>
                <p className="font-semibold">{readability.avgSentenceLength} words</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-md p-2">
                <p className="text-xs text-muted-foreground">Paragraphs</p>
                <p className="font-semibold">{readability.paragraphCount}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-md p-2">
                <p className="text-xs text-muted-foreground">Long Sentences</p>
                <p className="font-semibold">{readability.longSentences}</p>
              </div>
            </div>
          </div>
          
          {/* Recommendations */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Recommendations</p>
            <div className="space-y-1.5">
              {readability.avgSentenceLength > 20 && (
                <div className="flex items-start gap-2 text-xs">
                  <AlertCircle className="h-3.5 w-3.5 text-yellow-400 mt-0.5" />
                  <span>Try using shorter sentences to improve readability</span>
                </div>
              )}
              
              {readability.longSentences > 0 && (
                <div className="flex items-start gap-2 text-xs">
                  <AlertCircle className="h-3.5 w-3.5 text-yellow-400 mt-0.5" />
                  <span>Consider breaking down {readability.longSentences} long sentence{readability.longSentences > 1 ? 's' : ''}</span>
                </div>
              )}
              
              {readability.passiveVoice && (
                <div className="flex items-start gap-2 text-xs">
                  <AlertCircle className="h-3.5 w-3.5 text-yellow-400 mt-0.5" />
                  <span>Use active voice instead of passive for better engagement</span>
                </div>
              )}
              
              {readability.paragraphCount < 3 && content && (
                <div className="flex items-start gap-2 text-xs">
                  <AlertCircle className="h-3.5 w-3.5 text-yellow-400 mt-0.5" />
                  <span>Add more paragraph breaks to improve readability</span>
                </div>
              )}
              
              {readability.score >= 90 && (
                <div className="flex items-start gap-2 text-xs">
                  <CheckCircle className="h-3.5 w-3.5 text-green-400 mt-0.5" />
                  <span>Your content is highly readable!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
