
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Sparkles,
  RefreshCw,
  FileEdit,
  Wand2,
  ArrowRight,
  Heading2,
  KeyRound,
  BookOpen 
} from 'lucide-react';
import { toast } from 'sonner';
import { ScoreBadge } from '@/components/content/repository';
import { v4 as uuidv4 } from 'uuid';
import { SeoImprovement } from '@/contexts/content-builder/types';

export const OptimizationStep = () => {
  const { state, dispatch, rewriteContent, setContent } = useContentBuilder();
  const { content, mainKeyword, selectedKeywords, seoScore, seoImprovements } = state;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywordUsage, setKeywordUsage] = useState<{ keyword: string; count: number; density: string }[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [scores, setScores] = useState({
    keywordUsage: 0,
    contentLength: 0,
    readability: 0
  });

  // State for content rewriting
  const [showRewriteDialog, setShowRewriteDialog] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);
  const [rewriteType, setRewriteType] = useState<string>('');
  const [rewrittenContent, setRewrittenContent] = useState<string>('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [improvements, setImprovements] = useState<SeoImprovement[]>([]);
  
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
    const keywords = [mainKeyword, ...(selectedKeywords || []).filter(k => k !== mainKeyword)];
    
    const usageData = keywords.map(keyword => {
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
      // Local analysis without relying on external API
      // 1. Calculate various scores
      const keywordUsageScore = calculateKeywordUsageScore();
      const contentLengthScore = calculateContentLengthScore();
      const readabilityScore = calculateReadabilityScore();
      
      // 2. Generate recommendations based on analysis
      const contentRecommendations = generateRecommendations(
        keywordUsageScore, 
        contentLengthScore, 
        readabilityScore
      );
      
      setRecommendations(contentRecommendations);
      setScores({
        keywordUsage: keywordUsageScore,
        contentLength: contentLengthScore,
        readability: readabilityScore
      });
      
      // 3. Create SEO improvements
      const newImprovements = contentRecommendations.map(recommendation => {
        const improvementType = getImprovementType(recommendation);
        return {
          id: uuidv4(),
          type: improvementType,
          recommendation,
          applied: false
        };
      });
      
      setImprovements(newImprovements);
      dispatch({ type: 'SET_SEO_IMPROVEMENTS', payload: newImprovements });
      
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
  
  const getImprovementType = (recommendation: string): 'keyword' | 'readability' | 'structure' | 'general' => {
    const lowerRec = recommendation.toLowerCase();
    
    if (lowerRec.includes('keyword') || lowerRec.includes('density')) {
      return 'keyword';
    } else if (lowerRec.includes('sentence') || lowerRec.includes('paragraph') || 
               lowerRec.includes('readability')) {
      return 'readability';
    } else if (lowerRec.includes('heading') || lowerRec.includes('structure') || 
               lowerRec.includes('h2') || lowerRec.includes('h3')) {
      return 'structure';
    } else {
      return 'general';
    }
  };
  
  const calculateKeywordUsageScore = () => {
    // Calculate based on keyword presence and density
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
    if (!content) return 0;
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    
    // Score based on content length
    if (wordCount < 300) return 30;
    if (wordCount >= 300 && wordCount < 600) return 50;
    if (wordCount >= 600 && wordCount < 1200) return 80;
    if (wordCount >= 1200) return 100;
    return 0;
  };
  
  const calculateReadabilityScore = () => {
    if (!content) return 0;
    
    // Simple readability calculation based on:
    // - Sentence length (shorter is better)
    // - Word length (shorter is better)
    // - Paragraph length (shorter is better)
    
    const sentences = content.split(/[.!?]+/).filter(Boolean);
    const words = content.split(/\s+/).filter(Boolean);
    const paragraphs = content.split(/\n\s*\n/).filter(Boolean);
    
    // Average sentence length (in words)
    const avgSentenceLength = words.length / Math.max(sentences.length, 1);
    // Average word length (in characters)
    const avgWordLength = words.join('').length / Math.max(words.length, 1);
    // Average paragraph length (in sentences)
    const avgParagraphLength = sentences.length / Math.max(paragraphs.length, 1);
    
    let readabilityScore = 100;
    
    // Penalize for long sentences (ideal: 15-20 words)
    if (avgSentenceLength > 25) readabilityScore -= 20;
    else if (avgSentenceLength > 20) readabilityScore -= 10;
    else if (avgSentenceLength < 10) readabilityScore -= 5; // Too short can be choppy
    
    // Penalize for long words (ideal: ~5 characters)
    if (avgWordLength > 7) readabilityScore -= 15;
    else if (avgWordLength > 6) readabilityScore -= 5;
    
    // Penalize for long paragraphs (ideal: 3-5 sentences)
    if (avgParagraphLength > 7) readabilityScore -= 15;
    else if (avgParagraphLength > 5) readabilityScore -= 5;
    
    return Math.max(Math.min(readabilityScore, 100), 0);
  };
  
  const generateRecommendations = (keywordScore: number, lengthScore: number, readabilityScore: number) => {
    const recommendations: string[] = [];
    
    // Keyword usage recommendations
    if (keywordScore < 70) {
      const mainKeywordUsage = keywordUsage.find(k => k.keyword === mainKeyword);
      const density = mainKeywordUsage ? parseFloat(mainKeywordUsage.density) : 0;
      
      if (density < 0.5) {
        recommendations.push(`Increase usage of your main keyword "${mainKeyword}" (current density: ${density}%, aim for 1-2%)`);
      } else if (density > 5) {
        recommendations.push(`Reduce usage of your main keyword "${mainKeyword}" as it appears too frequently (current density: ${density}%, aim for 1-2%)`);
      }
    }
    
    // Content length recommendations
    if (lengthScore < 80) {
      const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;
      if (wordCount < 300) {
        recommendations.push('Content is too short. Aim for at least 600 words for better search ranking');
      } else if (wordCount < 600) {
        recommendations.push('Consider expanding your content to at least 600 words for better search ranking');
      }
    }
    
    // Readability recommendations
    if (readabilityScore < 70) {
      const sentences = content?.split(/[.!?]+/).filter(Boolean) || [];
      const avgSentenceLength = sentences.reduce((sum, sent) => sum + sent.split(/\s+/).filter(Boolean).length, 0) / Math.max(sentences.length, 1);
      
      if (avgSentenceLength > 20) {
        recommendations.push('Your sentences are too long. Consider breaking them into shorter, more digestible sentences');
      }
      
      const paragraphs = content?.split(/\n\s*\n/).filter(Boolean) || [];
      if (paragraphs.some(p => p.split(/\s+/).filter(Boolean).length > 100)) {
        recommendations.push('Some paragraphs are too long. Break them into smaller paragraphs for better readability');
      }
    }
    
    // General recommendations
    if (!recommendations.includes('Add a compelling meta description')) {
      recommendations.push('Add a compelling meta description that includes your main keyword');
    }
    
    if (!recommendations.includes('Use your main keyword in the title')) {
      recommendations.push('Use your main keyword in the title, preferably near the beginning');
    }
    
    if (!recommendations.includes('Add internal links')) {
      recommendations.push('Add internal links to other relevant content on your site');
    }
    
    if (!recommendations.includes('Add external links')) {
      recommendations.push('Add external links to authoritative sources to boost credibility');
    }
    
    if (!recommendations.includes('Use headings')) {
      recommendations.push('Use headings (H2, H3) to structure your content and include keywords in them');
    }
    
    // Return a maximum of 8 recommendations
    return recommendations.slice(0, 8);
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  const getRecommendationIcon = (recommendation: string) => {
    if (recommendation.toLowerCase().includes('keyword')) 
      return <KeyRound className="h-4 w-4 text-purple-500" />;
    if (recommendation.toLowerCase().includes('sentence') || recommendation.toLowerCase().includes('paragraph')) 
      return <BookOpen className="h-4 w-4 text-blue-500" />;
    if (recommendation.toLowerCase().includes('heading')) 
      return <Heading2 className="h-4 w-4 text-green-500" />;
    if (recommendation.toLowerCase().includes('meta')) 
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <Sparkles className="h-4 w-4 text-blue-500" />;
  };

  // Content rewriting functions
  const handleRewriteContent = (recommendation: string) => {
    setSelectedRecommendation(recommendation);
    const improvementType = getImprovementType(recommendation);
    
    let type = 'general';
    if (improvementType === 'keyword') type = 'keyword optimization';
    if (improvementType === 'readability') type = 'readability';
    if (improvementType === 'structure') type = 'structure';
    
    setRewriteType(type);
    
    // Generate rewritten content preview based on recommendation type
    generateRewrittenContent(recommendation, type);
    
    setShowRewriteDialog(true);
  };
  
  const generateRewrittenContent = (recommendation: string, type: string) => {
    if (!content) return;
    
    setIsRewriting(true);
    
    try {
      // This would ideally use an API call to an AI service like OpenAI/Perplexity
      // For demo purposes, we'll use local logic to simulate content improvements
      
      let newContent = content;
      const lowerRec = recommendation.toLowerCase();
      
      if (type === 'keyword optimization' || lowerRec.includes('keyword')) {
        // Add or reduce keywords based on recommendation
        if (lowerRec.includes('increase usage')) {
          // Add the keyword more throughout the text
          const paragraphs = content.split('\n\n');
          newContent = paragraphs.map((para, i) => {
            // Add keyword to paragraphs that don't have it
            if (!para.toLowerCase().includes(mainKeyword.toLowerCase()) && i % 2 === 0 && para.length > 100) {
              const sentences = para.split('. ');
              if (sentences.length > 1) {
                sentences[1] = sentences[1].replace(/^/, `When considering ${mainKeyword}, `);
                return sentences.join('. ');
              }
            }
            return para;
          }).join('\n\n');
          
          // Add to heading if possible
          if (!newContent.toLowerCase().includes(`# ${mainKeyword.toLowerCase()}`)) {
            const lines = newContent.split('\n');
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].startsWith('# ')) {
                lines[i] = lines[i].replace('# ', `# ${mainKeyword}: `);
                break;
              }
            }
            newContent = lines.join('\n');
          }
        } else if (lowerRec.includes('reduce usage')) {
          // Replace some instances of the keyword with synonyms or pronouns
          const regex = new RegExp(`\\b${mainKeyword}\\b`, 'gi');
          let count = 0;
          newContent = content.replace(regex, (match) => {
            count++;
            // Replace every other occurrence
            return count % 2 === 0 ? 'this topic' : match;
          });
        }
      } else if (type === 'readability' || lowerRec.includes('sentence') || lowerRec.includes('paragraph')) {
        if (lowerRec.includes('sentences are too long')) {
          // Break long sentences into shorter ones
          newContent = content.replace(/([.!?])\s+/g, '$1\n');
          
          // Further break very long sentences by adding periods
          newContent = newContent.split('\n').map(line => {
            if (line.split(' ').length > 25) {
              // Find a good spot to break the sentence
              const words = line.split(' ');
              let result = '';
              let chunk = '';
              
              for (let i = 0; i < words.length; i++) {
                chunk += (i > 0 ? ' ' : '') + words[i];
                if (i > 0 && i % 15 === 0 && 
                    !chunk.endsWith('.') && !chunk.endsWith('!') && !chunk.endsWith('?')) {
                  result += chunk + '. ';
                  chunk = '';
                }
              }
              return result + chunk;
            }
            return line;
          }).join('\n');
          
        } else if (lowerRec.includes('paragraphs are too long')) {
          // Break long paragraphs into shorter ones
          const paragraphs = content.split('\n\n');
          newContent = paragraphs.map(para => {
            // If paragraph has more than 100 words, break it
            if (para.split(' ').length > 100) {
              const sentences = para.split(/(?<=[.!?])\s+/);
              let result = '';
              let chunk = '';
              
              for (let i = 0; i < sentences.length; i++) {
                chunk += (i > 0 ? ' ' : '') + sentences[i];
                if (i > 0 && i % 3 === 0) {  // Break every 3 sentences
                  result += chunk + '\n\n';
                  chunk = '';
                }
              }
              return result + chunk;
            }
            return para;
          }).join('\n\n');
        }
      } else if (type === 'structure' || lowerRec.includes('heading') || lowerRec.includes('h2')) {
        if (lowerRec.includes('use headings')) {
          // Add headings to structure content
          const paragraphs = content.split('\n\n');
          if (paragraphs.length > 3) {
            // Add a heading before the third paragraph if none exists
            if (!paragraphs[2].startsWith('#')) {
              const heading = `## Key Points About ${mainKeyword}`;
              paragraphs.splice(2, 0, heading);
            }
            
            // Add another heading later in the content
            if (paragraphs.length > 6 && !paragraphs[5].startsWith('#')) {
              const heading = `## Considerations for ${mainKeyword}`;
              paragraphs.splice(5, 0, heading);
            }
            
            newContent = paragraphs.join('\n\n');
          }
        }
      }
      
      setTimeout(() => {
        setRewrittenContent(newContent);
        setIsRewriting(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error generating content rewrite:', error);
      setIsRewriting(false);
      toast.error('Failed to rewrite content');
    }
  };
  
  const applyRewrittenContent = () => {
    if (!rewrittenContent) return;
    
    // Apply the rewritten content
    setContent(rewrittenContent);
    toast.success(`Content optimized for ${rewriteType}`);
    
    // Close the dialog
    setShowRewriteDialog(false);
    
    // Run analysis again to update scores
    setTimeout(() => {
      runSeoAnalysis();
    }, 500);
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
            <CardTitle className="text-sm flex justify-between items-center">
              <span>Optimization Recommendations</span>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-400/30">
                Click on suggestions to optimize
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations.length > 0 ? (
              <ul className="space-y-3">
                {recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2 group">
                    <div className="mt-1">{getRecommendationIcon(recommendation)}</div>
                    <div className="flex-1">
                      <span className="text-sm">{recommendation}</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="opacity-0 group-hover:opacity-100 transition-opacity gap-1 bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20"
                      onClick={() => handleRewriteContent(recommendation)}
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      <span>Optimize</span>
                    </Button>
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
                    strokeWidth="10" 
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
                <Progress value={scores.keywordUsage} className="h-1.5" />
              </div>
              <div>
                <div className="text-xs mb-1 font-medium">Content Length</div>
                <Progress value={scores.contentLength} className="h-1.5" />
              </div>
              <div>
                <div className="text-xs mb-1 font-medium">Readability</div>
                <Progress value={scores.readability} className="h-1.5" />
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
      
      {/* Content Rewriting Dialog */}
      <AlertDialog open={showRewriteDialog} onOpenChange={setShowRewriteDialog}>
        <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-500" />
              <span>Content Optimization</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRecommendation}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4 space-y-4">
            {isRewriting ? (
              <div className="flex flex-col items-center justify-center py-12">
                <RefreshCw className="h-10 w-10 animate-spin text-purple-500 mb-4" />
                <p className="text-center text-muted-foreground">
                  Optimizing your content for better {rewriteType}...
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                    Optimized Content Preview
                  </Badge>
                </div>
                
                <div className="border rounded-md p-4 bg-zinc-900/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500/20 to-blue-500/20 text-xs px-2 py-0.5">
                    Optimized for {rewriteType}
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {rewrittenContent || "No preview available"}
                  </pre>
                </div>
              </>
            )}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={applyRewrittenContent} 
              disabled={isRewriting || !rewrittenContent}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-1"
            >
              {isRewriting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              Apply Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
