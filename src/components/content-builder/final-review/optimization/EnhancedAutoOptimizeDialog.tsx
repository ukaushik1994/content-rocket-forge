import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle2, BarChart3, FileText, Target, Zap, Settings, Sparkles, Brain, Eye, History } from 'lucide-react';
import { useContentOptimizer } from './useContentOptimizer';
import { useContentQualityIntegration } from './hooks/useContentQualityIntegration';
import { EnhancedSerpItemsReference } from './components/EnhancedSerpItemsReference';
import { EnhancedSuggestionSection } from './components/EnhancedSuggestionSection';
import { UnifiedSuggestion } from './types';
import { ProviderManager } from '../../provider/ProviderManager';
import { AiProvider } from '@/services/aiService/types';

interface EnhancedAutoOptimizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onContentUpdate: (newContent: string) => void;
}

interface OptimizationSettings {
  provider: AiProvider;
  tone: 'professional' | 'casual' | 'technical' | 'friendly' | 'authoritative';
  audience: 'beginner' | 'intermediate' | 'expert' | 'general';
  seoFocus: 'light' | 'moderate' | 'aggressive';
  contentLength: 'shorter' | 'maintain' | 'longer';
  creativity: number; // 0-100
  preserveStructure: boolean;
  includeExamples: boolean;
  enhanceReadability: boolean;
  customInstructions: string;
}

interface OptimizationHistory {
  id: string;
  timestamp: Date;
  settings: OptimizationSettings;
  originalLength: number;
  optimizedLength: number;
  appliedSuggestions: number;
}

export function EnhancedAutoOptimizeDialog({ 
  isOpen, 
  onClose, 
  content, 
  onContentUpdate 
}: EnhancedAutoOptimizeDialogProps) {
  const [currentTab, setCurrentTab] = useState('analysis');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationHistory[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSettings>({
    provider: 'openrouter',
    tone: 'professional',
    audience: 'general',
    seoFocus: 'moderate',
    contentLength: 'maintain',
    creativity: 50,
    preserveStructure: true,
    includeExamples: true,
    enhanceReadability: true,
    customInstructions: ''
  });

  const {
    isAnalyzing,
    isOptimizing,
    contentSuggestions,
    solutionSuggestions,
    aiDetectionSuggestions,
    serpIntegrationSuggestions,
    analyzeContent,
    optimizeContent,
    selectedSuggestions,
    toggleSuggestion,
    incorporateAllSerpItems
  } = useContentOptimizer(content);

  const {
    completionPercentage,
    qualitySuggestions,
    categorizedSuggestions,
    hasFailedChecks,
    passedChecks,
    totalChecks
  } = useContentQualityIntegration();

  // Initialize analysis when dialog opens
  useEffect(() => {
    if (isOpen && !isAnalyzing && !contentSuggestions.length && !qualitySuggestions.length) {
      analyzeContent();
    }
  }, [isOpen, isAnalyzing, contentSuggestions, qualitySuggestions, analyzeContent]);

  const handleAdvancedOptimization = async () => {
    const optimizedContent = await optimizeContent();
    if (optimizedContent) {
      // Add to history
      const historyEntry: OptimizationHistory = {
        id: Date.now().toString(),
        timestamp: new Date(),
        settings: { ...optimizationSettings },
        originalLength: content.length,
        optimizedLength: optimizedContent.length,
        appliedSuggestions: selectedSuggestions.length
      };
      
      setOptimizationHistory(prev => [historyEntry, ...prev.slice(0, 4)]); // Keep last 5
      onContentUpdate(optimizedContent);
      setCurrentTab('analysis'); // Return to analysis tab
    }
  };

  const handlePreviewOptimization = async () => {
    setPreviewMode(true);
    const optimizedContent = await optimizeContent();
    if (optimizedContent) {
      setPreviewContent(optimizedContent);
    }
    setPreviewMode(false);
  };

  const handleProviderChange = (provider: AiProvider) => {
    setOptimizationSettings(prev => ({ ...prev, provider }));
  };

  const convertToUnified = (suggestions: any[]): UnifiedSuggestion[] => {
    return suggestions.map(s => ({
      ...s,
      type: s.type as any,
      priority: s.priority as any
    }));
  };

  const allSuggestions = [
    ...convertToUnified(contentSuggestions),
    ...convertToUnified(solutionSuggestions),
    ...convertToUnified(aiDetectionSuggestions),
    ...convertToUnified(serpIntegrationSuggestions),
    ...qualitySuggestions
  ];

  const hasSuggestions = allSuggestions.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-background/95 backdrop-blur-md border border-border/50">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Enhanced AI Content Optimization
              </DialogTitle>
              <DialogDescription>
                Advanced content analysis and optimization with multiple AI providers
              </DialogDescription>
            </div>
            
            <ProviderManager
              selectedProvider={optimizationSettings.provider}
              onProviderChange={handleProviderChange}
              showStatus={true}
            />
          </div>
          
          {/* Quality Overview */}
          <div className="grid grid-cols-4 gap-4 mt-4 p-4 bg-background/50 rounded-lg border border-border/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{completionPercentage}%</div>
              <div className="text-xs text-muted-foreground">Quality Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{passedChecks}</div>
              <div className="text-xs text-muted-foreground">Checks Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-500">{allSuggestions.length}</div>
              <div className="text-xs text-muted-foreground">Suggestions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{content.split(' ').length}</div>
              <div className="text-xs text-muted-foreground">Words</div>
            </div>
          </div>
        </DialogHeader>
        
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-center text-muted-foreground">
              Analyzing content with advanced AI detection and optimization...
            </p>
            <div className="mt-4 space-y-2 text-center">
              <div className="text-xs text-muted-foreground">• Deep content structure analysis</div>
              <div className="text-xs text-muted-foreground">• SEO and readability optimization</div>
              <div className="text-xs text-muted-foreground">• SERP integration opportunities</div>
              <div className="text-xs text-muted-foreground">• AI content humanization</div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="analysis" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Analysis
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Suggestions ({allSuggestions.length})
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-y-auto mt-4">
                <TabsContent value="analysis" className="space-y-4 mt-0">
                  {hasSuggestions ? (
                    <div className="space-y-6">
                      <EnhancedSerpItemsReference onIncorporateAllSerp={incorporateAllSerpItems} />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Content Quality ({contentSuggestions.length})
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {contentSuggestions.slice(0, 3).map(suggestion => (
                                <div key={suggestion.id} className="text-xs p-2 bg-muted/30 rounded">
                                  <div className="font-medium">{suggestion.title}</div>
                                  <div className="text-muted-foreground">{suggestion.description}</div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              SERP Integration ({serpIntegrationSuggestions.length})
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {serpIntegrationSuggestions.slice(0, 3).map(suggestion => (
                                <div key={suggestion.id} className="text-xs p-2 bg-muted/30 rounded">
                                  <div className="font-medium">{suggestion.title}</div>
                                  <div className="text-muted-foreground">{suggestion.description}</div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <h3 className="text-lg font-medium mb-2">Excellent Content Quality!</h3>
                      <p className="text-muted-foreground">Your content meets all quality standards.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="suggestions" className="space-y-4 mt-0">
                  <Tabs defaultValue="quality" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="quality">Quality ({qualitySuggestions.length})</TabsTrigger>
                      <TabsTrigger value="content">Content ({contentSuggestions.length})</TabsTrigger>
                      <TabsTrigger value="serp">SERP ({serpIntegrationSuggestions.length})</TabsTrigger>
                      <TabsTrigger value="ai">AI ({aiDetectionSuggestions.length})</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="quality" className="space-y-4">
                      {hasFailedChecks ? (
                        <div className="space-y-4">
                          <EnhancedSuggestionSection
                            title="Critical Issues"
                            suggestions={categorizedSuggestions.critical}
                            selectedSuggestions={selectedSuggestions}
                            onToggleSuggestion={toggleSuggestion}
                          />
                          <EnhancedSuggestionSection
                            title="Major Improvements"
                            suggestions={categorizedSuggestions.major}
                            selectedSuggestions={selectedSuggestions}
                            onToggleSuggestion={toggleSuggestion}
                          />
                          <EnhancedSuggestionSection
                            title="Minor Enhancements"
                            suggestions={categorizedSuggestions.minor}
                            selectedSuggestions={selectedSuggestions}
                            onToggleSuggestion={toggleSuggestion}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                          <h3 className="text-lg font-medium mb-2">All Quality Checks Passed!</h3>
                          <p className="text-muted-foreground">Your content is optimized and ready.</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="content">
                      <EnhancedSuggestionSection
                        title="Content Improvements"
                        suggestions={convertToUnified([...contentSuggestions, ...solutionSuggestions])}
                        selectedSuggestions={selectedSuggestions}
                        onToggleSuggestion={toggleSuggestion}
                        showCategory={false}
                      />
                    </TabsContent>
                    
                    <TabsContent value="serp">
                      <EnhancedSerpItemsReference onIncorporateAllSerp={incorporateAllSerpItems} />
                      <EnhancedSuggestionSection
                        title="SERP Integration Opportunities"
                        suggestions={convertToUnified(serpIntegrationSuggestions)}
                        selectedSuggestions={selectedSuggestions}
                        onToggleSuggestion={toggleSuggestion}
                        showCategory={false}
                      />
                    </TabsContent>
                    
                    <TabsContent value="ai">
                      <EnhancedSuggestionSection
                        title="AI Content Humanization"
                        suggestions={convertToUnified(aiDetectionSuggestions)}
                        selectedSuggestions={selectedSuggestions}
                        onToggleSuggestion={toggleSuggestion}
                        showCategory={false}
                      />
                    </TabsContent>
                  </Tabs>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Content Optimization</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Tone</Label>
                          <Select 
                            value={optimizationSettings.tone} 
                            onValueChange={(value: any) => setOptimizationSettings(prev => ({ ...prev, tone: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="casual">Casual</SelectItem>
                              <SelectItem value="technical">Technical</SelectItem>
                              <SelectItem value="friendly">Friendly</SelectItem>
                              <SelectItem value="authoritative">Authoritative</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Target Audience</Label>
                          <Select 
                            value={optimizationSettings.audience} 
                            onValueChange={(value: any) => setOptimizationSettings(prev => ({ ...prev, audience: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                              <SelectItem value="general">General Audience</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Content Length</Label>
                          <Select 
                            value={optimizationSettings.contentLength} 
                            onValueChange={(value: any) => setOptimizationSettings(prev => ({ ...prev, contentLength: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="shorter">Make Shorter</SelectItem>
                              <SelectItem value="maintain">Maintain Length</SelectItem>
                              <SelectItem value="longer">Make Longer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Advanced Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>SEO Focus</Label>
                          <Select 
                            value={optimizationSettings.seoFocus} 
                            onValueChange={(value: any) => setOptimizationSettings(prev => ({ ...prev, seoFocus: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light SEO</SelectItem>
                              <SelectItem value="moderate">Moderate SEO</SelectItem>
                              <SelectItem value="aggressive">Aggressive SEO</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Creativity Level: {optimizationSettings.creativity}%</Label>
                          <Slider
                            value={[optimizationSettings.creativity]}
                            onValueChange={([value]) => setOptimizationSettings(prev => ({ ...prev, creativity: value }))}
                            max={100}
                            step={10}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Preserve Structure</Label>
                            <Switch
                              checked={optimizationSettings.preserveStructure}
                              onCheckedChange={(checked) => setOptimizationSettings(prev => ({ ...prev, preserveStructure: checked }))}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Include Examples</Label>
                            <Switch
                              checked={optimizationSettings.includeExamples}
                              onCheckedChange={(checked) => setOptimizationSettings(prev => ({ ...prev, includeExamples: checked }))}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Enhance Readability</Label>
                            <Switch
                              checked={optimizationSettings.enhanceReadability}
                              onCheckedChange={(checked) => setOptimizationSettings(prev => ({ ...prev, enhanceReadability: checked }))}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Custom Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Add specific instructions for optimization..."
                        value={optimizationSettings.customInstructions}
                        onChange={(e) => setOptimizationSettings(prev => ({ ...prev, customInstructions: e.target.value }))}
                        className="min-h-[100px]"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="preview" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Optimization Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Button 
                          onClick={handlePreviewOptimization}
                          disabled={selectedSuggestions.length === 0 || previewMode}
                          className="w-full"
                        >
                          {previewMode ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating Preview...
                            </>
                          ) : (
                            'Generate Preview'
                          )}
                        </Button>
                        
                        {previewContent && (
                          <div className="border rounded-lg p-4 bg-muted/30 max-h-[400px] overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-sm">{previewContent}</pre>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="history" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Optimization History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {optimizationHistory.length > 0 ? (
                        <div className="space-y-3">
                          {optimizationHistory.map((entry) => (
                            <div key={entry.id} className="border rounded-lg p-3 bg-muted/30">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium">
                                  {entry.timestamp.toLocaleString()}
                                </div>
                                <Badge variant="outline">{entry.settings.provider}</Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                                <div>Applied: {entry.appliedSuggestions} suggestions</div>
                                <div>Length: {entry.originalLength} → {entry.optimizedLength}</div>
                                <div>Tone: {entry.settings.tone}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <History className="w-8 h-8 mx-auto mb-2" />
                          <p>No optimization history yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  {selectedSuggestions.length} of {allSuggestions.length} suggestions selected
                </div>
                <div className="text-sm text-muted-foreground">
                  Provider: <span className="font-medium">{optimizationSettings.provider}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAdvancedOptimization}
                  disabled={isOptimizing || selectedSuggestions.length === 0}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    `Apply ${selectedSuggestions.length} Optimizations`
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}