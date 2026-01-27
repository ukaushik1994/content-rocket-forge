
import { ContentBuilderState, ContentBuilderAction } from '../types/index';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// SEO analysis scoring functions
function calculateKeywordDensity(content: string, keyword: string): number {
  if (!keyword || !content) return 0;
  const words = content.toLowerCase().split(/\s+/);
  const keywordLower = keyword.toLowerCase();
  const keywordCount = words.filter(w => w.includes(keywordLower)).length;
  return (keywordCount / words.length) * 100;
}

function checkHeadingStructure(content: string): { hasH1: boolean; hasH2: boolean; properHierarchy: boolean } {
  const h1Match = content.match(/^#\s+.+$/gm) || content.match(/<h1[^>]*>.*?<\/h1>/gi);
  const h2Match = content.match(/^##\s+.+$/gm) || content.match(/<h2[^>]*>.*?<\/h2>/gi);
  const h3Match = content.match(/^###\s+.+$/gm) || content.match(/<h3[^>]*>.*?<\/h3>/gi);
  
  const hasH1 = (h1Match?.length || 0) === 1; // Should have exactly one H1
  const hasH2 = (h2Match?.length || 0) >= 2; // Should have at least 2 H2s
  const properHierarchy = hasH1 && (h2Match?.length || 0) > 0;
  
  return { hasH1, hasH2, properHierarchy };
}

function checkMetaOptimization(metaTitle: string | null, metaDescription: string | null): {
  titleScore: number;
  descriptionScore: number;
} {
  let titleScore = 0;
  let descriptionScore = 0;
  
  if (metaTitle) {
    titleScore += 30;
    if (metaTitle.length >= 30 && metaTitle.length <= 60) titleScore += 20;
    else if (metaTitle.length > 0) titleScore += 10;
  }
  
  if (metaDescription) {
    descriptionScore += 30;
    if (metaDescription.length >= 120 && metaDescription.length <= 160) descriptionScore += 20;
    else if (metaDescription.length > 0) descriptionScore += 10;
  }
  
  return { titleScore, descriptionScore };
}

function analyzeReadability(content: string): number {
  if (!content) return 0;
  
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  const avgSentenceLength = words.length / sentences.length;
  const avgParagraphLength = words.length / paragraphs.length;
  
  let score = 50; // Base score
  
  // Good sentence length (15-20 words)
  if (avgSentenceLength >= 10 && avgSentenceLength <= 25) score += 20;
  else if (avgSentenceLength < 10 || avgSentenceLength > 30) score -= 10;
  
  // Good paragraph length (50-150 words)
  if (avgParagraphLength >= 40 && avgParagraphLength <= 180) score += 15;
  
  // Has enough paragraphs (structural variety)
  if (paragraphs.length >= 5) score += 15;
  
  return Math.max(0, Math.min(100, score));
}

async function performSeoAnalysis(
  content: string,
  options: {
    keyword?: string;
    metaTitle?: string | null;
    metaDescription?: string | null;
  }
): Promise<{
  overallScore: number;
  keywordScore: number;
  structureScore: number;
  metaScore: number;
  readabilityScore: number;
  improvements: Array<{ id: string; type: string; recommendation: string; impact: 'high' | 'medium' | 'low'; applied: boolean }>;
}> {
  const { keyword, metaTitle, metaDescription } = options;
  const improvements: Array<{ id: string; type: string; recommendation: string; impact: 'high' | 'medium' | 'low'; applied: boolean }> = [];
  
  // Keyword analysis
  let keywordScore = 50;
  if (keyword) {
    const density = calculateKeywordDensity(content, keyword);
    if (density >= 0.5 && density <= 2.5) {
      keywordScore = 85;
    } else if (density < 0.5) {
      keywordScore = 40;
      improvements.push({
        id: 'keyword-density-low',
        type: 'keyword',
        recommendation: `Consider including "${keyword}" more frequently (current density: ${density.toFixed(1)}%)`,
        impact: 'high',
        applied: false
      });
    } else {
      keywordScore = 60;
      improvements.push({
        id: 'keyword-density-high',
        type: 'keyword',
        recommendation: `Keyword "${keyword}" appears too frequently. Consider reducing to avoid over-optimization`,
        impact: 'medium',
        applied: false
      });
    }
  }
  
  // Structure analysis
  const headingAnalysis = checkHeadingStructure(content);
  let structureScore = 50;
  
  if (headingAnalysis.hasH1) structureScore += 20;
  else improvements.push({
    id: 'missing-h1',
    type: 'structure',
    recommendation: 'Add a single H1 heading at the beginning of your content',
    impact: 'high',
    applied: false
  });
  
  if (headingAnalysis.hasH2) structureScore += 20;
  else improvements.push({
    id: 'missing-h2',
    type: 'structure',
    recommendation: 'Add H2 subheadings to break up your content into logical sections',
    impact: 'high',
    applied: false
  });
  
  if (headingAnalysis.properHierarchy) structureScore += 10;
  
  // Meta analysis
  const metaAnalysis = checkMetaOptimization(metaTitle || null, metaDescription || null);
  const metaScore = metaAnalysis.titleScore + metaAnalysis.descriptionScore;
  
  if (metaAnalysis.titleScore < 50) {
    improvements.push({
      id: 'meta-title',
      type: 'meta',
      recommendation: 'Optimize your meta title to be between 30-60 characters',
      impact: 'high',
      applied: false
    });
  }
  
  if (metaAnalysis.descriptionScore < 50) {
    improvements.push({
      id: 'meta-description',
      type: 'meta',
      recommendation: 'Optimize your meta description to be between 120-160 characters',
      impact: 'high',
      applied: false
    });
  }
  
  // Readability analysis
  const readabilityScore = analyzeReadability(content);
  
  if (readabilityScore < 60) {
    improvements.push({
      id: 'readability',
      type: 'content',
      recommendation: 'Improve readability by using shorter sentences and more paragraph breaks',
      impact: 'medium',
      applied: false
    });
  }
  
  // Calculate overall score
  const overallScore = Math.round(
    (keywordScore * 0.25) +
    (structureScore * 0.25) +
    (metaScore * 0.25) +
    (readabilityScore * 0.25)
  );
  
  return {
    overallScore,
    keywordScore,
    structureScore,
    metaScore,
    readabilityScore,
    improvements
  };
}

export const createSeoActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const analyzeSeo = async (content: string) => {
    try {
      console.log('Starting SEO analysis for content:', content.substring(0, 100) + '...');
      
      // Perform real SEO analysis
      const analysis = await performSeoAnalysis(content, {
        keyword: state.mainKeyword,
        metaTitle: state.metaTitle,
        metaDescription: state.metaDescription
      });
      
      // Set the real SEO score
      dispatch({ type: 'SET_SEO_SCORE', payload: analysis.overallScore });
      
      // Add improvements to state
      analysis.improvements.forEach(improvement => {
        dispatch({ type: 'ADD_SEO_IMPROVEMENT', payload: improvement });
      });
      
      // Mark step as analyzed regardless of score
      dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
      
      // Also mark step as completed if we've analyzed it
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
      
      // Show feedback to user
      if (analysis.overallScore >= 80) {
        toast.success(`Great SEO score: ${analysis.overallScore}%`);
      } else if (analysis.overallScore >= 60) {
        toast.info(`SEO score: ${analysis.overallScore}% - Check recommendations for improvements`);
      } else {
        toast.warning(`SEO score: ${analysis.overallScore}% - Consider applying suggested improvements`);
      }
      
    } catch (error) {
      console.error('SEO analysis failed:', error);
      toast.error('SEO analysis failed. Please try again.');
      
      // Still mark as analyzed to not block workflow
      dispatch({ type: 'SET_SEO_SCORE', payload: 50 });
      dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    }
  };
  
  const applySeoImprovement = (id: string) => {
    dispatch({ type: 'APPLY_SEO_IMPROVEMENT', payload: id });
    
    // Check if enough improvements have been applied to complete the step
    const totalImprovements = state.seoImprovements.length;
    const appliedImprovements = state.seoImprovements.filter(imp => imp.applied || imp.id === id).length;
    
    // Mark step as completed if more than 60% of improvements are applied or at least 3
    if (appliedImprovements >= Math.max(3, Math.ceil(totalImprovements * 0.6))) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    }
  };
  
  const skipOptimizationStep = () => {
    // Mark the step as skipped
    dispatch({ type: 'SKIP_OPTIMIZATION_STEP' });
    
    // Also mark the step as analyzed and completed so we can move forward
    dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    
    // Force completion to ensure we can move forward
    console.log('Optimization step skipped and marked as completed');
  };
  
  return {
    analyzeSeo,
    applySeoImprovement,
    skipOptimizationStep
  };
};
