import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  Target, 
  Search, 
  FileCheck,
  Shield,
  TrendingUp,
  AlertCircle,
  ClipboardCheck,
  Save,
  X,
  Brain,
  Sparkles,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComplianceDashboard } from './optimization/components/ComplianceDashboard';
import { ComplianceHighlightedViewer } from './optimization/components/ComplianceHighlightedViewer';
import { OptimizationSuggestionsPanel } from './optimization/components/OptimizationSuggestionsPanel';
import { ComplianceFixPreview } from './optimization/ComplianceFixPreview';
import { useContentCompliance } from '@/hooks/useContentCompliance';
import { useContentOptimizer } from './optimization/useContentOptimizer';
import { analyzeContentForComplianceHighlights } from '@/services/complianceHighlightingService';
import { HighlightAnalysisResult } from '@/services/contentHighlightingService';
import { ComplianceViolation } from '@/types/contentCompliance';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';

interface AutoOptimizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onContentUpdate: (newContent: string) => void;
}

type WorkflowStep = 'unified-analysis' | 'review-results' | 'implementation';

interface ComplianceCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  violations: {
    id: string;
    message: string;
    description: string;
    severity: 'critical' | 'major' | 'minor';
    category: string;
    textLocation?: {
      start: number;
      end: number;
      text: string;
    };
  }[];
}

export const AutoOptimizeModal: React.FC<AutoOptimizeModalProps> = ({
  isOpen,
  onClose,
  content,
  onContentUpdate
}) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('unified-analysis');
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'compliance' | 'ai'>('compliance');
  const [highlightAnalysis, setHighlightAnalysis] = useState<HighlightAnalysisResult | null>(null);
  const [selectedViolations, setSelectedViolations] = useState<string[]>([]);
  const [selectedAISuggestions, setSelectedAISuggestions] = useState<string[]>([]);
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>([]);
  const [showAIFixPreview, setShowAIFixPreview] = useState(false);
  const [isGeneratingFix, setIsGeneratingFix] = useState(false);
  const [fixPreviewContent, setFixPreviewContent] = useState<string | null>(null);
  const [appliedFixes, setAppliedFixes] = useState<string[]>([]);
  const [aiAnalysisComplete, setAIAnalysisComplete] = useState(false);
  
  const { 
    state, 
    saveOptimizationSelections, 
    getOptimizationSelections, 
    applyOptimizationChanges,
    applyComplianceFixes,
    previewComplianceFixes
  } = useContentBuilder();

  // Compliance Analysis Hook
  const {
    isAnalyzing: isComplianceAnalyzing,
    analysisError: complianceError,
    complianceResult,
    runComplianceAnalysis,
    clearAnalysis,
    getOverallCompliance,
    getCriticalViolations,
    hasKeywordIssues,
    hasSerpIssues,
    hasSolutionIssues,
    hasStructureIssues
  } = useContentCompliance();

  // AI Analysis Hook (without SERP)
  const {
    isAnalyzing: isAIAnalyzing,
    contentSuggestions,
    aiDetectionSuggestions,
    solutionSuggestions,
    qualitySuggestions,
    selectedSuggestions,
    analysisError: aiError,
    analyzeContent: runAIAnalysis,
    toggleSuggestion,
    getTotalSuggestionCount,
    optimizeContent: performAIOptimization
  } = useContentOptimizer(content);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('unified-analysis');
      setActiveAnalysisTab('compliance');
      setHighlightAnalysis(null);
      setSelectedViolations([]);
      setSelectedAISuggestions([]);
      setSelectedHighlights([]);
      setShowAIFixPreview(false);
      setFixPreviewContent(null);
      setAppliedFixes([]);
      setAIAnalysisComplete(false);
    }
  }, [isOpen]);

  // Organize violations into categories
  const complianceCategories: ComplianceCategory[] = complianceResult ? [
    {
      id: 'keyword',
      title: 'Keyword Usage',
      icon: Search,
      color: 'text-green-600',
      violations: complianceResult.keyword.violations.map(v => ({
        ...v,
        description: v.suggestion || 'No additional details provided',
        severity: v.severity === 'warning' ? 'major' as const : v.severity === 'critical' ? 'critical' as const : 'minor' as const,
        category: 'keyword'
      }))
    },
    {
      id: 'serp',
      title: 'SERP Integration',
      icon: TrendingUp,
      color: 'text-blue-600',
      violations: complianceResult.serp.violations.map(v => ({
        ...v,
        description: v.suggestion || 'No additional details provided',
        severity: v.severity === 'warning' ? 'major' as const : v.severity === 'critical' ? 'critical' as const : 'minor' as const,
        category: 'serp'
      }))
    },
    {
      id: 'solution',
      title: 'Solution Integration',
      icon: Target,
      color: 'text-indigo-600',
      violations: complianceResult.solution.violations.map(v => ({
        ...v,
        description: v.suggestion || 'No additional details provided',
        severity: v.severity === 'warning' ? 'major' as const : v.severity === 'critical' ? 'critical' as const : 'minor' as const,
        category: 'solution'
      }))
    },
    {
      id: 'structure',
      title: 'Content Structure',
      icon: FileCheck,
      color: 'text-orange-600',
      violations: complianceResult.structure.violations.map(v => ({
        ...v,
        description: v.suggestion || 'No additional details provided',
        severity: v.severity === 'warning' ? 'major' as const : v.severity === 'critical' ? 'critical' as const : 'minor' as const,
        category: 'structure'
      }))
    }
  ].filter(category => category.violations.length > 0) : [];

  const handleStartUnifiedAnalysis = async () => {
    setCurrentStep('unified-analysis');
    
    try {
      console.log('🚀 Starting unified analysis (Compliance + AI)...');
      
      // Run both analyses in parallel
      const [complianceResults, aiResults] = await Promise.allSettled([
        runComplianceAnalysis(),
        runAIAnalysis()
      ]);
      
      let hasComplianceIssues = false;
      let hasAISuggestions = false;
      let totalIssues = 0;
      
      // Check compliance results
      if (complianceResults.status === 'fulfilled' && complianceResult) {
        hasComplianceIssues = complianceResult.overall.totalViolations > 0;
        totalIssues += complianceResult.overall.totalViolations;
        console.log(`✅ Compliance analysis complete: ${complianceResult.overall.totalViolations} issues found`);
      } else {
        console.log('⚠️ Compliance analysis failed:', complianceResults.status === 'rejected' ? complianceResults.reason : 'No results');
      }
      
      // Check AI results  
      if (aiResults.status === 'fulfilled') {
        const aiSuggestionCount = getTotalSuggestionCount();
        hasAISuggestions = aiSuggestionCount > 0;
        totalIssues += aiSuggestionCount;
        setAIAnalysisComplete(true);
        console.log(`✅ AI analysis complete: ${aiSuggestionCount} suggestions found`);
      } else {
        console.log('⚠️ AI analysis failed:', aiResults.reason);
      }
      
      // Proceed to review if we have any results
      if (hasComplianceIssues || hasAISuggestions) {
        setCurrentStep('review-results');
        toast.success(`Analysis complete! Found ${totalIssues} optimization opportunities.`);
      } else {
        toast.success('Analysis complete! Your content is well-optimized.');
        onClose();
      }
      
    } catch (error: any) {
      console.error('❌ Unified analysis failed:', error);
      setCurrentStep('unified-analysis');
      toast.error('Analysis failed. Please try again.');
    }
  };

  const handleGenerateHighlights = async () => {
    const hasSelectedViolations = selectedViolations.length > 0;
    const hasSelectedAI = selectedAISuggestions.length > 0;
    
    if (!hasSelectedViolations && !hasSelectedAI) {
      toast.error('Please select at least one issue or suggestion to fix');
      return;
    }

    try {
      console.log('🎨 Generating unified optimization highlights...');
      
      if (complianceResult) {
        const analysis = await analyzeContentForComplianceHighlights(content, complianceResult);
        setHighlightAnalysis(analysis);
        
        console.log(`✅ Generated ${analysis.highlights.length} optimization highlights`);
        setCurrentStep('implementation');
      }
      
    } catch (error) {
      console.error('Highlight generation error:', error);
      toast.error('Failed to generate highlights - please try again');
      setCurrentStep('review-results');
    }
  };

  const handleApplyUnifiedChanges = async () => {
    const hasComplianceFixes = selectedViolations.length > 0;
    const hasAIOptimizations = selectedAISuggestions.length > 0;
    
    if (!hasComplianceFixes && !hasAIOptimizations) {
      toast.error('Please select at least one optimization to apply');
      return;
    }

    try {
      let updatedContent = content;
      let appliedCount = 0;

      // Apply AI optimizations first if selected
      if (hasAIOptimizations) {
        // Set selected suggestions in the optimizer
        selectedAISuggestions.forEach(id => toggleSuggestion(id));
        const aiOptimizedContent = await performAIOptimization();
        if (aiOptimizedContent) {
          updatedContent = aiOptimizedContent;
          appliedCount += selectedAISuggestions.length;
        }
      }

      // Apply compliance fixes if selected
      if (hasComplianceFixes) {
        const selectedViolationObjects = complianceCategories
          .flatMap(cat => cat.violations)
          .filter(violation => selectedViolations.includes(violation.id));
        
        const { fixedContent, appliedFixes } = await applyComplianceFixes(selectedViolationObjects, updatedContent);
        updatedContent = fixedContent;
        appliedCount += appliedFixes.length;
      }
      
      // Apply highlight-based changes if any
      if (selectedHighlights.length > 0) {
        await saveOptimizationSelections([...selectedViolations, ...selectedAISuggestions], selectedHighlights);
        updatedContent = await applyOptimizationChanges(selectedHighlights, updatedContent);
        appliedCount += selectedHighlights.length;
      }
      
      onContentUpdate(updatedContent);
      toast.success(`Applied ${appliedCount} optimizations successfully!`);
      onClose();
    } catch (error) {
      console.error('Error applying unified changes:', error);
      toast.error('Failed to apply optimizations - please try again');
    }
  };

  const handleShowUnifiedPreview = () => {
    const hasSelected = selectedViolations.length > 0 || selectedAISuggestions.length > 0;
    if (!hasSelected) {
      toast.warning('Please select optimizations to preview');
      return;
    }
    setShowAIFixPreview(true);
  };

  const handleGeneratePreview = async () => {
    if (!content || (selectedViolations.length === 0 && selectedAISuggestions.length === 0)) return;
    
    setIsGeneratingFix(true);
    try {
      const selectedViolationObjects = complianceCategories
        .flatMap(cat => cat.violations)
        .filter(violation => selectedViolations.includes(violation.id));
      
      const preview = await previewComplianceFixes(selectedViolationObjects, content);
      setFixPreviewContent(preview);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Failed to generate fix preview');
    } finally {
      setIsGeneratingFix(false);
    }
  };

  const handleApplyAIFixes = async () => {
    if (!content || !fixPreviewContent) return;
    
    try {
      const selectedViolationObjects = complianceCategories
        .flatMap(cat => cat.violations)
        .filter(violation => selectedViolations.includes(violation.id));
      
      const { fixedContent, appliedFixes } = await applyComplianceFixes(selectedViolationObjects, content);
      onContentUpdate(fixedContent);
      setAppliedFixes(appliedFixes);
      toast.success(`Applied ${appliedFixes.length} AI-powered compliance fixes!`);
      
      // Close modal after brief delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error applying fixes:', error);
      toast.error('Failed to apply compliance fixes');
    }
  };

  const handleCloseAIPreview = () => {
    setShowAIFixPreview(false);
    setFixPreviewContent(null);
  };

  // Helper functions for highlight selection
  const toggleHighlight = (highlightId: string) => {
    setSelectedHighlights(prev => 
      prev.includes(highlightId)
        ? prev.filter(id => id !== highlightId)
        : [...prev, highlightId]
    );
  };

  const selectAllHighlights = () => {
    if (highlightAnalysis) {
      setSelectedHighlights(highlightAnalysis.highlights.map(h => h.id));
    }
  };

  const clearAllHighlights = () => {
    setSelectedHighlights([]);
  };

  // Helper functions for violation selection
  const toggleViolation = (violationId: string) => {
    setSelectedViolations(prev => 
      prev.includes(violationId)
        ? prev.filter(id => id !== violationId)
        : [...prev, violationId]
    );
  };

  // Helper functions for AI suggestion selection
  const toggleAISuggestion = (suggestionId: string) => {
    setSelectedAISuggestions(prev => 
      prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  };

  const selectAllCritical = () => {
    const criticalViolations = complianceCategories
      .flatMap(cat => cat.violations)
      .filter(v => v.severity === 'critical')
      .map(v => v.id);
    criticalViolations.forEach(id => {
      if (!selectedViolations.includes(id)) {
        toggleViolation(id);
      }
    });
  };

  const clearAllViolations = () => {
    setSelectedViolations([]);
  };

  const selectAllInCategory = (categoryId: string) => {
    const category = complianceCategories.find(c => c.id === categoryId);
    if (category) {
      category.violations.forEach(violation => {
        if (!selectedViolations.includes(violation.id)) {
          toggleViolation(violation.id);
        }
      });
    }
  };

  const getTotalViolationCount = () => {
    return complianceCategories.reduce((total, cat) => total + cat.violations.length, 0);
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const renderUnifiedAnalysisStep = () => {
    const isAnalyzing = isComplianceAnalyzing || isAIAnalyzing;
    const analysisError = complianceError || aiError;
    
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
              {isAnalyzing ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : (
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-white" />
                  <Brain className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {isAnalyzing ? 'Running Comprehensive Analysis' : 'Ready to Optimize Content'}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {isAnalyzing 
                ? 'Analyzing your content with both rule-based compliance checks and AI-powered optimization suggestions'
                : 'Click below to run both compliance analysis and AI-powered content optimization.'
              }
            </p>
            
            {isAnalyzing && (
              <div className="mt-6 max-w-md mx-auto space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="font-medium text-green-600 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Compliance Analysis
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${isComplianceAnalyzing ? 'text-muted-foreground' : 'text-green-600'}`}>
                      {isComplianceAnalyzing ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      <span>Rule-based checks</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-purple-600 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      AI Analysis
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${isAIAnalyzing ? 'text-muted-foreground' : aiAnalysisComplete ? 'text-purple-600' : 'text-muted-foreground'}`}>
                      {isAIAnalyzing ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : aiAnalysisComplete ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <div className="w-3 h-3 border border-gray-300 rounded-full" />
                      )}
                      <span>AI suggestions</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {!isAnalyzing && (
            <div className="space-y-4">
              {analysisError && (
                <div className="max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Analysis Error</span>
                  </div>
                  <p className="text-sm text-red-700 mb-3">
                    {analysisError}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleStartUnifiedAnalysis}
                    className="w-full"
                  >
                    Try Again
                  </Button>
                </div>
              )}
              
              {!analysisError && (
                <Button onClick={handleStartUnifiedAnalysis} size="lg" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Start Comprehensive Analysis
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  const renderReviewResultsStep = () => {
    const totalComplianceIssues = complianceResult ? complianceResult.overall.totalViolations : 0;
    const totalAISuggestions = getTotalSuggestionCount();
    const totalIssues = totalComplianceIssues + totalAISuggestions;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <h3 className="text-xl font-semibold mb-2">Analysis Complete</h3>
          <p className="text-muted-foreground">
            {totalIssues > 0 
              ? `Found ${totalIssues} optimization opportunities (${totalComplianceIssues} compliance issues + ${totalAISuggestions} AI suggestions)`
              : 'Your content is well-optimized!'
            }
          </p>
        </div>

        {totalIssues > 0 && (
          <>
            <Tabs value={activeAnalysisTab} onValueChange={(value) => setActiveAnalysisTab(value as 'compliance' | 'ai')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="compliance" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Compliance Issues ({totalComplianceIssues})
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Suggestions ({totalAISuggestions})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="compliance" className="space-y-4 mt-6">
                {complianceResult && (
                  <>
                    <ComplianceDashboard complianceResult={complianceResult} />
                    
                    <div className="space-y-4">
                      {complianceCategories.map((category) => (
                        <Card key={category.id} className="border-l-4 border-l-primary/20">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <category.icon className={`w-5 h-5 ${category.color}`} />
                                <CardTitle className="text-base">{category.title}</CardTitle>
                                <Badge variant="secondary" className="text-xs">
                                  {category.violations.length}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => selectAllInCategory(category.id)}
                                className="text-xs"
                              >
                                Select All
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {category.violations.map((violation) => (
                              <div key={violation.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                                <Checkbox
                                  checked={selectedViolations.includes(violation.id)}
                                  onCheckedChange={() => toggleViolation(violation.id)}
                                  className="mt-0.5"
                                />
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-sm">{violation.message}</h4>
                                    <Badge 
                                      className={`text-xs ${
                                        violation.severity === 'critical' 
                                          ? 'bg-red-100 text-red-800 border-red-200' 
                                          : violation.severity === 'major' 
                                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                                          : 'bg-blue-100 text-blue-800 border-blue-200'
                                      }`}
                                    >
                                      {violation.severity}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{violation.description}</p>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="ai" className="space-y-4 mt-6">
                {(contentSuggestions.length > 0 || aiDetectionSuggestions.length > 0 || solutionSuggestions.length > 0 || qualitySuggestions.length > 0) ? (
                  <div className="space-y-4">
                    {/* Content Quality Suggestions */}
                    {contentSuggestions.length > 0 && (
                      <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <CardTitle className="text-base">Content Quality</CardTitle>
                              <Badge variant="secondary" className="text-xs">
                                {contentSuggestions.length}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {contentSuggestions.map((suggestion) => (
                            <div key={suggestion.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                              <Checkbox
                                checked={selectedAISuggestions.includes(suggestion.id)}
                                onCheckedChange={() => toggleAISuggestion(suggestion.id)}
                                className="mt-0.5"
                              />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-sm">{suggestion.title}</h4>
                                  <Badge 
                                    className={`text-xs ${
                                      suggestion.priority === 'high' 
                                        ? 'bg-red-100 text-red-800' 
                                        : suggestion.priority === 'medium' 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : 'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {suggestion.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* AI Detection Suggestions */}
                    {aiDetectionSuggestions.length > 0 && (
                      <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Brain className="w-5 h-5 text-purple-600" />
                              <CardTitle className="text-base">AI Detection</CardTitle>
                              <Badge variant="secondary" className="text-xs">
                                {aiDetectionSuggestions.length}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {aiDetectionSuggestions.map((suggestion) => (
                            <div key={suggestion.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                              <Checkbox
                                checked={selectedAISuggestions.includes(suggestion.id)}
                                onCheckedChange={() => toggleAISuggestion(suggestion.id)}
                                className="mt-0.5"
                              />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-sm">{suggestion.title}</h4>
                                  <Badge 
                                    className={`text-xs ${
                                      suggestion.priority === 'high' 
                                        ? 'bg-red-100 text-red-800' 
                                        : suggestion.priority === 'medium' 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : 'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {suggestion.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Solution Analysis Suggestions */}
                    {solutionSuggestions.length > 0 && (
                      <Card className="border-l-4 border-l-indigo-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Target className="w-5 h-5 text-indigo-600" />
                              <CardTitle className="text-base">Solution Integration</CardTitle>
                              <Badge variant="secondary" className="text-xs">
                                {solutionSuggestions.length}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {solutionSuggestions.map((suggestion) => (
                            <div key={suggestion.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                              <Checkbox
                                checked={selectedAISuggestions.includes(suggestion.id)}
                                onCheckedChange={() => toggleAISuggestion(suggestion.id)}
                                className="mt-0.5"
                              />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-sm">{suggestion.title}</h4>
                                  <Badge 
                                    className={`text-xs ${
                                      suggestion.priority === 'high' 
                                        ? 'bg-red-100 text-red-800' 
                                        : suggestion.priority === 'medium' 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : 'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {suggestion.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No AI Suggestions Available</h3>
                    <p className="text-muted-foreground">
                      Either the AI analysis is still running or your content doesn't need optimization.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-between pt-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('unified-analysis')}
                >
                  Back to Analysis
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleShowUnifiedPreview}
                  disabled={selectedViolations.length === 0 && selectedAISuggestions.length === 0}
                >
                  Preview Changes
                </Button>
                <Button
                  onClick={handleGenerateHighlights}
                  disabled={selectedViolations.length === 0 && selectedAISuggestions.length === 0}
                  className="gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  Apply Optimizations
                </Button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    );
  };

  const renderImplementationStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <Settings className="w-8 h-8 text-blue-500 mx-auto mb-2" />
        <h3 className="text-xl font-semibold mb-2">Ready to Apply Changes</h3>
        <p className="text-muted-foreground">
          Review and apply the selected optimizations to your content
        </p>
      </div>

      {highlightAnalysis && complianceResult && (
        <ComplianceHighlightedViewer
          content={content}
          highlightResult={highlightAnalysis}
          complianceResult={complianceResult}
          onHighlightSelect={(highlightIds: string[]) => {
            setSelectedHighlights(highlightIds);
          }}
        />
      )}

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('review-results')}
        >
          Back to Review
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleShowUnifiedPreview}
          >
            Preview Changes
          </Button>
          <Button
            onClick={handleApplyUnifiedChanges}
            disabled={selectedViolations.length === 0 && selectedAISuggestions.length === 0 && selectedHighlights.length === 0}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Apply All Changes
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'unified-analysis':
        return renderUnifiedAnalysisStep();
      case 'review-results':
        return renderReviewResultsStep();
      case 'implementation':
        return renderImplementationStep();
      default:
        return renderUnifiedAnalysisStep();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              Auto-Optimize Content
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderCurrentStep()}
                </motion.div>
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>

        {/* Preview Modal */}
        {showAIFixPreview && (
          <Dialog open={showAIFixPreview} onOpenChange={() => setShowAIFixPreview(false)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <ComplianceFixPreview
                originalContent={content}
                fixedContent={fixPreviewContent}
                selectedViolations={selectedViolations.map(id => 
                  complianceCategories.flatMap(cat => cat.violations).find(v => v.id === id)
                ).filter(Boolean)}
                appliedFixes={appliedFixes}
                isGeneratingFix={isGeneratingFix}
                onGeneratePreview={handleGeneratePreview}
                onApplyFixes={handleApplyAIFixes}
                onCancel={() => setShowAIFixPreview(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};