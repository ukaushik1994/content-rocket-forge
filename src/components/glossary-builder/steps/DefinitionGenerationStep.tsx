import React from 'react';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const DefinitionGenerationStep = () => {
  const { state, generateDefinitions } = useGlossaryBuilder();
  const { selectedTerms, selectedSolution, isGenerating, generationProgress } = state;

  const handleGenerate = async () => {
    await generateDefinitions(selectedTerms, selectedSolution);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Definition Generation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            <p className="text-muted-foreground">
              Ready to generate AI-powered definitions for {selectedTerms.length} terms
              {selectedSolution && ` with ${selectedSolution.name} context`}.
            </p>
            
            {isGenerating ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <Progress value={generationProgress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Generating definitions... {generationProgress}%
                </p>
              </div>
            ) : (
              <Button onClick={handleGenerate} className="bg-gradient-to-r from-primary to-blue-500">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Definitions
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};