import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { 
  Sparkles, 
  Loader2, 
  CheckCircle2,
  Brain,
  Zap,
  Target
} from 'lucide-react';

export const DefinitionGenerationStep = () => {
  const { state, generateDefinitions } = useGlossaryBuilder();
  const { selectedTerms, isGenerating, generatedTerms } = state;
  const [progress, setProgress] = useState(0);
  const [currentTerm, setCurrentTerm] = useState('');

  useEffect(() => {
    if (isGenerating && selectedTerms.length > 0) {
      // Simulate progress updates
      const interval = setInterval(() => {
        setProgress(prev => {
          const increment = 100 / selectedTerms.length / 10; // 10 updates per term
          return Math.min(prev + increment, 100);
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isGenerating, selectedTerms.length]);

  const handleGenerateDefinitions = async () => {
    setProgress(0);
    await generateDefinitions(selectedTerms);
  };

  const completedTerms = generatedTerms.length;
  const totalTerms = selectedTerms.length;
  const isComplete = completedTerms === totalTerms && totalTerms > 0;

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Interactive Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.7, 0.3],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-flex items-center gap-3 px-6 py-3 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <Brain className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">AI Definition Generation</span>
            {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-purple-500 bg-clip-text text-transparent">
            Generate Smart
            <br />
            <span className="text-primary">Definitions</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Our AI will create comprehensive definitions for your selected terms, 
            including context, examples, and related information.
          </p>
        </motion.div>

        {/* Generation Status */}
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-background/60 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Definition Generation
                </div>
                <div className="text-sm text-muted-foreground">
                  {completedTerms} / {totalTerms} completed
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-background/40 rounded-lg">
                  <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="font-semibold text-lg">{totalTerms}</div>
                  <div className="text-sm text-muted-foreground">Total Terms</div>
                </div>
                <div className="text-center p-4 bg-background/40 rounded-lg">
                  <Zap className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="font-semibold text-lg">{completedTerms}</div>
                  <div className="text-sm text-muted-foreground">Generated</div>
                </div>
                <div className="text-center p-4 bg-background/40 rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="font-semibold text-lg">{Math.round(progress)}%</div>
                  <div className="text-sm text-muted-foreground">Progress</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Generation Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Current Status */}
              <AnimatePresence mode="wait">
                {!isGenerating && !isComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center py-8"
                  >
                    <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Ready to Generate</h3>
                    <p className="text-muted-foreground mb-6">
                      Click the button below to start generating definitions for {totalTerms} selected terms
                    </p>
                    <Button 
                      onClick={handleGenerateDefinitions}
                      size="lg"
                      className="bg-gradient-to-r from-primary to-purple-500 hover:from-purple-500 hover:to-primary"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Definitions
                    </Button>
                  </motion.div>
                )}

                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="inline-block mb-4"
                    >
                      <Loader2 className="h-12 w-12 text-primary" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2">Generating Definitions...</h3>
                    <p className="text-muted-foreground">
                      AI is creating comprehensive definitions for your terms
                    </p>
                    {currentTerm && (
                      <p className="text-sm text-primary mt-2">
                        Current: {currentTerm}
                      </p>
                    )}
                  </motion.div>
                )}

                {isComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2">Generation Complete!</h3>
                    <p className="text-muted-foreground">
                      Successfully generated {completedTerms} definitions. Ready for review!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected Terms Preview */}
              {selectedTerms.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Selected Terms:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTerms.map((term) => (
                      <div
                        key={term}
                        className={`
                          px-3 py-1 rounded-full text-sm border
                          ${generatedTerms.some(gt => gt.term === term)
                            ? 'bg-green-500/20 border-green-500/30 text-green-700'
                            : 'bg-background/40 border-border/30'
                          }
                        `}
                      >
                        {term}
                        {generatedTerms.some(gt => gt.term === term) && (
                          <CheckCircle2 className="inline ml-1 h-3 w-3" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};