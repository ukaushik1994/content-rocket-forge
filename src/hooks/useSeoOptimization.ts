
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  seoOptimizationService, 
  SeoOptimizationConfig, 
  SeoAnalysisResults, 
  SeoRecommendation 
} from '@/services/seoOptimizationService';
import { SerpAnalysisResult } from '@/services/serpAnalysisService';

export function useSeoOptimization() {
  const [content, setContent] = useState('');
  const [configuration, setConfiguration] = useState<SeoOptimizationConfig>({
    targetKeyword: '',
    secondaryKeywords: [],
    contentType: 'article',
    targetAudience: 'intermediate',
    writingStyle: 'professional'
  });
  
  const [analysisResults, setAnalysisResults] = useState<SeoAnalysisResults | null>(null);
  const [recommendations, setRecommendations] = useState<SeoRecommendation[]>([]);
  const [serpData, setSerpData] = useState<SerpAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeContent = useCallback(async () => {
    if (!content || !configuration.targetKeyword) {
      toast.error('Please provide content and target keyword');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      toast.loading('Analyzing your content...', { id: 'seo-analysis' });
      
      const results = await seoOptimizationService.analyzeContent(content, configuration);
      
      setAnalysisResults(results.analysis);
      setRecommendations(results.recommendations);
      setSerpData(results.serpData);
      
      toast.success('Analysis completed successfully!', { id: 'seo-analysis' });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze content. Please try again.', { id: 'seo-analysis' });
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, configuration]);

  const applyRecommendation = useCallback(async (recommendation: SeoRecommendation) => {
    if (!recommendation.autoApplicable) {
      toast.error('This recommendation requires manual implementation');
      return;
    }

    try {
      toast.loading('Applying recommendation...', { id: 'apply-rec' });
      
      const improvedContent = await seoOptimizationService.applyRecommendation(
        content, 
        recommendation
      );
      
      setContent(improvedContent);
      
      // Mark recommendation as applied
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendation.id 
            ? { ...rec, applied: true } 
            : rec
        )
      );
      
      toast.success('Recommendation applied successfully!', { id: 'apply-rec' });
      
      // Optionally re-analyze to show improvements
      // await analyzeContent();
    } catch (error) {
      console.error('Failed to apply recommendation:', error);
      toast.error('Failed to apply recommendation', { id: 'apply-rec' });
    }
  }, [content]);

  const exportResults = useCallback(() => {
    if (!analysisResults) {
      toast.error('No analysis results to export');
      return;
    }

    const exportData = {
      content,
      configuration,
      analysisResults,
      recommendations,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Results exported successfully!');
  }, [content, configuration, analysisResults, recommendations]);

  return {
    content,
    setContent,
    configuration,
    setConfiguration,
    analysisResults,
    recommendations,
    serpData,
    isAnalyzing,
    analyzeContent,
    applyRecommendation,
    exportResults
  };
}
