import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { Brain, CheckCircle, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface DefinitionGenerationStepProps {
  onStepComplete: () => void;
}

export function DefinitionGenerationStep({ onStepComplete }: DefinitionGenerationStepProps) {
  const { state, generateDefinitions } = useGlossaryBuilder();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const selectedTerms = state.selectedTerms;
  const totalTerms = selectedTerms.length;

  // Check if definitions have been generated
  const hasGeneratedDefinitions = state.currentGlossary?.terms.length > 0;

  // Handle definition generation
  const handleGenerateDefinitions = async () => {
    if (selectedTerms.length === 0) {
      toast.error("No terms selected for definition generation");
      return;
    }

    setIsGenerating(true);
    setHasStarted(true);
    setProgress(0);
    setGeneratedCount(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 500);

      // Generate definitions
      await generateDefinitions(selectedTerms);
      
      clearInterval(progressInterval);
      setProgress(100);
      setGeneratedCount(totalTerms);
      
      toast.success(`Successfully generated definitions for ${totalTerms} terms!`);
      
      // Auto-complete step after successful generation
      setTimeout(() => {
        onStepComplete();
      }, 1000);

    } catch (error) {
      console.error('Error generating definitions:', error);
      toast.error("Failed to generate definitions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle proceeding without generation (if already have definitions)
  const handleProceed = () => {
    onStepComplete();
  };

  if (selectedTerms.length === 0) {
    return (
      <Card className="glass-card border-amber-500/20">
        <CardContent className="p-8 text-center">
          <div className="text-amber-400 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Terms Selected</h3>
          <p className="text-muted-foreground mb-4">
            Please go back and select terms for definition generation.
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-holographic flex items-center gap-3">
            <Brain className="h-8 w-8" />
            AI Definition Generation
          </CardTitle>
          <p className="text-muted-foreground">
            Generate comprehensive definitions, explanations, and related content for your selected terms using advanced AI.
          </p>
        </CardHeader>
      </Card>

      {/* Generation Settings */}
      <Card className="glass-card border-white/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">{totalTerms}</div>
              <p className="text-sm text-muted-foreground">Terms Selected</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-blue mb-1">{generatedCount}</div>
              <p className="text-sm text-muted-foreground">Definitions Generated</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-pink mb-1">
                {Math.round(progress)}%
              </div>
              <p className="text-sm text-muted-foreground">Progress</p>
            </div>
          </div>

          {/* Generation Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 glass-panel rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Smart Definitions</p>
                <p className="text-xs text-muted-foreground">AI-generated explanations</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 glass-panel rounded-lg">
              <CheckCircle className="h-5 w-5 text-neon-blue" />
              <div>
                <p className="font-medium text-sm">Related Terms</p>
                <p className="text-xs text-muted-foreground">Automatic linking</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 glass-panel rounded-lg">
              <Brain className="h-5 w-5 text-neon-pink" />
              <div>
                <p className="font-medium text-sm">SEO Optimized</p>
                <p className="text-xs text-muted-foreground">Search volume data</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 glass-panel rounded-lg">
              <Sparkles className="h-5 w-5 text-neon-orange" />
              <div>
                <p className="font-medium text-sm">PAA Questions</p>
                <p className="text-xs text-muted-foreground">Common questions</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {(isGenerating || hasStarted) && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Generation Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress 
                value={progress} 
                className="h-3 bg-white/5 border border-white/10 rounded-full overflow-hidden"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!hasGeneratedDefinitions && !hasStarted && (
              <Button
                onClick={handleGenerateDefinitions}
                disabled={isGenerating || selectedTerms.length === 0}
                className="flex-1 bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300 hover:scale-105 shadow-neon"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating Definitions...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5 mr-2" />
                    Generate {totalTerms} Definitions
                  </>
                )}
              </Button>
            )}

            {hasGeneratedDefinitions && (
              <Button
                onClick={handleProceed}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-500 transition-all duration-300 hover:scale-105"
                size="lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Review Generated Definitions
              </Button>
            )}

            {isGenerating && (
              <Button
                variant="outline"
                disabled
                className="glass-card border-white/20"
                size="lg"
              >
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Terms Preview */}
      <Card className="glass-card border-white/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Selected Terms</h3>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
            {selectedTerms.map((term, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="glass-card border-white/20 hover:border-primary/30 transition-colors"
              >
                {term}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {isGenerating && (
        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div>
                <p className="font-medium">Generating Definitions</p>
                <p className="text-sm text-muted-foreground">
                  AI is creating comprehensive definitions for your terms...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}