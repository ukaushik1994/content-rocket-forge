import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComplianceDashboard } from './optimization/components/ComplianceDashboard';
import { ComplianceHighlightedViewer } from './optimization/components/ComplianceHighlightedViewer';
import { OptimizationSuggestionsPanel } from './optimization/components/OptimizationSuggestionsPanel';
import { useContentCompliance } from '@/hooks/useContentCompliance';
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

type WorkflowStep = 'compliance-check' | 'review-results' | 'implementation';

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
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('compliance-check');
  const [highlightAnalysis, setHighlightAnalysis] = useState<HighlightAnalysisResult | null>(null);
  const [selectedViolations, setSelectedViolations] = useState<string[]>([]);
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>([]);
  
  const { 
    state, 
    saveOptimizationSelections, 
    getOptimizationSelections, 
    applyOptimizationChanges
  } = useContentBuilder();

  const {
    isAnalyzing,
    analysisError,
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

  // Reset step when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('compliance-check');
      setHighlightAnalysis(null);
      setSelectedViolations([]);
      setSelectedHighlights([]);
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

  const handleStartComplianceCheck = async () => {
    setCurrentStep('compliance-check');
    
    try {
      console.log('🚀 Starting compliance analysis...');
      await runComplianceAnalysis();
      
      if (complianceResult) {
        console.log(`✅ Compliance analysis complete, proceeding to review step`);
        setCurrentStep('review-results');
        toast.success(`Compliance analysis complete! Found ${complianceResult.overall.totalViolations} issues to review.`);
      } else {
        console.log('ℹ️ Compliance analysis completed but no issues found');
        toast.success('Compliance analysis complete! Your content meets all requirements.');
        onClose();
      }
    } catch (error: any) {
      console.error('❌ Compliance analysis failed:', error);
      setCurrentStep('compliance-check');
      toast.error('Compliance analysis failed. Please try again.');
    }
  };


  const handleGenerateHighlights = async () => {
    if (selectedViolations.length === 0 && !getOverallCompliance()) {
      toast.error('Please select at least one compliance issue to fix');
      return;
    }

    try {
      console.log('🎨 Generating compliance-based highlights...');
      
      if (complianceResult) {
        const analysis = await analyzeContentForComplianceHighlights(content, complianceResult);
        setHighlightAnalysis(analysis);
        
        console.log(`✅ Generated ${analysis.highlights.length} compliance highlights`);
        setCurrentStep('implementation');
      }
      
    } catch (error) {
      console.error('Highlight generation error:', error);
      toast.error('Failed to generate highlights - please try again');
      setCurrentStep('review-results');
    }
  };

  const handleApplyChanges = async () => {
    try {
      await saveOptimizationSelections(selectedViolations, selectedHighlights);
      const updatedContent = await applyOptimizationChanges(selectedHighlights, content);
      onContentUpdate(updatedContent);
      
      toast.success(`Applied ${selectedViolations.length} compliance fixes and ${selectedHighlights.length} highlights!`);
      onClose();
    } catch (error) {
      console.error('Error applying changes:', error);
      toast.error('Failed to apply changes - please try again');
    }
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

  const renderComplianceCheckStep = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
            {isAnalyzing ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <FileText className="w-8 h-8 text-white" />
            )}
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {isAnalyzing ? 'Analyzing Content Compliance' : 'Ready to Review Content'}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isAnalyzing 
              ? 'Running comprehensive compliance analysis: Keyword Usage → SERP Integration → Solution Compliance → Content Structure'
              : 'Click the button below to analyze your content against all compliance requirements.'
            }
          </p>
          
          {isAnalyzing && (
            <div className="mt-6 max-w-md mx-auto space-y-2">
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Checking Keyword Compliance</span>
                </div>
                <div className="text-xs opacity-70">Analyzing SERP Integration</div>
                <div className="text-xs opacity-70">Validating Solution Integration</div>
                <div className="text-xs opacity-70">Reviewing Content Structure</div>
              </div>
              <p className="text-xs text-muted-foreground">
                This analysis is instantaneous using rule-based checking
              </p>
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
                  onClick={handleStartComplianceCheck}
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            )}
            
            {!analysisError && (
              <Button onClick={handleStartComplianceCheck} size="lg" className="gap-2">
                <ClipboardCheck className="w-4 h-4" />
                Start Compliance Review
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );

  const renderReviewResultsStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <h3 className="text-xl font-semibold mb-2">Compliance Review Complete</h3>
        <p className="text-muted-foreground">
          {complianceResult ? 
            `Found ${complianceResult.overall.totalViolations} compliance issues to address` :
            'Your content meets all compliance requirements'
          }
        </p>
      </div>

      {complianceResult && (
        <>
          <ComplianceDashboard 
            complianceResult={complianceResult}
          />

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
                          <Badge variant="outline" className={`text-xs ${violation.severity === 'critical' ? 'bg-red-100 text-red-800 border-red-200' : violation.severity === 'major' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>
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

          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {selectedViolations.length} of {getTotalViolationCount()} issues selected
            </p>
            <Button onClick={handleGenerateHighlights} disabled={selectedViolations.length === 0} className="gap-2">
              <ArrowRight className="w-4 h-4" />
              Review Selected Issues
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] h-[95vh] max-w-none max-h-none p-0 overflow-hidden">
        <div className="h-full bg-background flex flex-col">
          
          {/* Header */}
          <div className="flex-shrink-0 border-b border-border bg-card/50 p-6">
            <div className="flex items-center justify-between">
              <div>
              <DialogTitle className="text-2xl font-bold">Content Review</DialogTitle>
              <p className="text-muted-foreground">Review and fix content compliance issues with instant analysis</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Two-column layout for implementation step */}
          {currentStep === 'implementation' && highlightAnalysis ? (
            <div className="flex-1 flex overflow-hidden">
              
              {/* Left Panel - Violations */}
              <div className="w-[40%] border-r border-border overflow-y-auto">
                <div className="p-6">
                  <OptimizationSuggestionsPanel
                    complianceCategories={complianceCategories}
                    selectedViolations={selectedViolations}
                    onToggleViolation={toggleViolation}
                    onSelectAllInCategory={selectAllInCategory}
                    onSelectAllCritical={selectAllCritical}
                    onClearAll={clearAllViolations}
                    totalViolationCount={getTotalViolationCount()}
                  />
                  
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" onClick={() => setCurrentStep('review-results')}>
                      Back
                    </Button>
                    <Button onClick={handleApplyChanges} className="gap-2 flex-1">
                      <Save className="w-4 h-4" />
                      Apply Fixes ({selectedViolations.length + selectedHighlights.length})
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Panel - Content with highlights */}
              <div className="w-[60%] overflow-y-auto">
                <div className="p-6">
            <ComplianceHighlightedViewer
              content={content}
              highlightResult={highlightAnalysis}
              complianceResult={complianceResult}
              onHighlightSelect={(highlightIds) => setSelectedHighlights(highlightIds)}
            />
                </div>
              </div>
            </div>
          ) : (
            // Single column layout for other steps
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {currentStep === 'compliance-check' && renderComplianceCheckStep()}
                {currentStep === 'review-results' && renderReviewResultsStep()}
              </AnimatePresence>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};