
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Target, 
  TrendingUp, 
  FileText, 
  Users, 
  ShoppingCart,
  Info,
  Navigation,
  Wand2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAdvancedSeoGeneration } from '@/hooks/seo/useAdvancedSeoGeneration';
import { motion, AnimatePresence } from 'framer-motion';

interface AdvancedSeoGeneratorProps {
  onContentGenerated?: (content: string, title: string, metaDescription: string) => void;
}

export const AdvancedSeoGenerator: React.FC<AdvancedSeoGeneratorProps> = ({
  onContentGenerated
}) => {
  const {
    generationResult,
    isGenerating,
    selectedContentType,
    setSelectedContentType,
    selectedIntent,
    setSelectedIntent,
    targetWordCount,
    setTargetWordCount,
    generateSeoContent,
    hasValidData
  } = useAdvancedSeoGeneration();

  const handleGenerate = async () => {
    await generateSeoContent();
  };

  const handleUseContent = () => {
    if (generationResult && onContentGenerated) {
      onContentGenerated(
        generationResult.content,
        generationResult.title,
        generationResult.metaDescription
      );
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'comprehensive': return <FileText className="h-4 w-4" />;
      case 'faq': return <Info className="h-4 w-4" />;
      case 'listicle': return <Target className="h-4 w-4" />;
      case 'comparison': return <TrendingUp className="h-4 w-4" />;
      case 'guide': return <Navigation className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'informational': return <Info className="h-4 w-4" />;
      case 'commercial': return <ShoppingCart className="h-4 w-4" />;
      case 'transactional': return <Target className="h-4 w-4" />;
      case 'navigational': return <Navigation className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getRankingPotentialColor = (potential: string) => {
    switch (potential) {
      case 'high': return 'text-green-500 bg-green-500/10 border-green-200';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-200';
      case 'low': return 'text-red-500 bg-red-500/10 border-red-200';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-200';
    }
  };

  if (!hasValidData) {
    return (
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <h3 className="font-medium text-yellow-700 mb-2">SERP Data Required</h3>
          <p className="text-sm text-yellow-600">
            Complete SERP analysis first to unlock advanced SEO content generation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generation Controls */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Wand2 className="h-5 w-5" />
            Advanced SEO Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Content Type</label>
            <Select value={selectedContentType} onValueChange={(value) => setSelectedContentType(value as typeof selectedContentType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comprehensive">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Comprehensive Guide
                  </div>
                </SelectItem>
                <SelectItem value="guide">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    Step-by-Step Guide
                  </div>
                </SelectItem>
                <SelectItem value="listicle">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Listicle/Top X
                  </div>
                </SelectItem>
                <SelectItem value="faq">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    FAQ Format
                  </div>
                </SelectItem>
                <SelectItem value="comparison">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Comparison
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Intent Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Search Intent</label>
            <Select value={selectedIntent} onValueChange={(value) => setSelectedIntent(value as typeof selectedIntent)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="informational">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Informational
                  </div>
                </SelectItem>
                <SelectItem value="commercial">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Commercial
                  </div>
                </SelectItem>
                <SelectItem value="transactional">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Transactional
                  </div>
                </SelectItem>
                <SelectItem value="navigational">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    Navigational
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Word Count Target */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Target Word Count: {targetWordCount}</label>
            <Slider
              value={[targetWordCount]}
              onValueChange={(value) => setTargetWordCount(value[0])}
              min={500}
              max={5000}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>500 words</span>
              <span>5000 words</span>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            size="lg"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Generating SEO Content...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Generate SEO Content
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generation Results */}
      <AnimatePresence>
        {generationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Content Score Overview */}
            <Card className={`border-2 ${getRankingPotentialColor(generationResult.rankingPotential)}`}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    SEO Content Analysis
                  </span>
                  <Badge variant={generationResult.rankingPotential === 'high' ? 'default' : 'secondary'}>
                    {generationResult.rankingPotential.toUpperCase()} Ranking Potential
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Content Score</span>
                      <span className="text-sm font-bold">{generationResult.contentScore}/100</span>
                    </div>
                    <Progress value={generationResult.contentScore} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Entities Used:</span>
                      <span className="font-medium ml-2">{generationResult.entities.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Semantic Keywords:</span>
                      <span className="font-medium ml-2">{generationResult.semanticKeywords.length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generated Content Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Generated Content</span>
                  <Button onClick={handleUseContent} className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Use This Content
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title & Meta */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">SEO Title</label>
                    <p className="font-semibold text-lg">{generationResult.title}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Meta Description</label>
                    <p className="text-sm text-muted-foreground">{generationResult.metaDescription}</p>
                  </div>
                </div>

                {/* Content Preview */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Content Preview</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {generationResult.content.substring(0, 500)}...
                    </pre>
                  </div>
                </div>

                {/* Suggestions */}
                {generationResult.suggestions.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Optimization Suggestions</label>
                    <ul className="mt-2 space-y-1">
                      {generationResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
