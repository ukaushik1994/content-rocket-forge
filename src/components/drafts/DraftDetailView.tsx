
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ContentType } from '@/contexts/content-builder/types/content-types';
import { CheckCircle2, Edit2, FileText, Tag, Clock, BarChart2, Search, Puzzle, FileCode, TrendingUp, Users, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { extractDocumentStructure } from '@/utils/seo/document/extractDocumentStructure';
import { analyzeSolutionIntegration } from '@/utils/seo/solution/analyzeSolutionIntegration';
import { motion, AnimatePresence } from 'framer-motion';

interface DraftDetailViewProps {
  open: boolean;
  onClose: () => void;
  draft: any | null;
}

export function DraftDetailView({ open, onClose, draft }: DraftDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'metadata'>('content');
  const [serpData, setSerpData] = useState(null);
  const [documentStructure, setDocumentStructure] = useState(null);
  const [solutionMetrics, setSolutionMetrics] = useState(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  
  // Load analysis data when metadata tab is selected
  useEffect(() => {
    if (activeTab === 'metadata' && draft && draft.content) {
      loadAnalysisData();
    }
  }, [activeTab, draft]);

  const loadAnalysisData = async () => {
    if (!draft || !draft.content) return;
    
    setIsLoadingAnalysis(true);
    
    try {
      // Extract document structure
      const structure = extractDocumentStructure(draft.content);
      setDocumentStructure(structure);
      
      // Analyze SERP data if keywords available
      if (draft.keywords && draft.keywords.length > 0) {
        const mainKeyword = draft.keywords[0];
        const serpAnalysis = await analyzeKeywordSerp(mainKeyword);
        setSerpData(serpAnalysis);
      }
      
      // Analyze solution integration if solution data is available
      if (draft.metadata?.selectedSolution) {
        const solutionAnalysis = analyzeSolutionIntegration(draft.content, draft.metadata.selectedSolution);
        setSolutionMetrics(solutionAnalysis);
      }
    } catch (error) {
      console.error('Error loading analysis data:', error);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };
  
  if (!draft) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const MetricCard = ({ icon: Icon, title, value, trend, trendValue, color = "blue" }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-4 hover:border-white/30 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}-500/20 text-${color}-400 group-hover:bg-${color}-500/30 transition-colors`}>
          <Icon className="h-4 w-4" />
        </div>
        {trend && (
          <div className={`flex items-center text-xs ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            {trendValue}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-white/90">{title}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </motion.div>
  );

  const renderSerpAnalysis = () => {
    if (!serpData) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 text-center"
        >
          <Search className="h-12 w-12 text-blue-400 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-semibold text-white/80 mb-2">SERP Analysis</h3>
          <p className="text-sm text-white/60">No SERP data available for analysis</p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Search className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">SERP Intelligence</h3>
            <p className="text-sm text-white/60">Search engine optimization insights</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard
            icon={Tag}
            title="Keywords"
            value={serpData.keywords?.length || 0}
            color="blue"
          />
          <MetricCard
            icon={Users}
            title="Questions"
            value={serpData.peopleAlsoAsk?.length || 0}
            color="green"
          />
          <MetricCard
            icon={Target}
            title="Entities"
            value={serpData.entities?.length || 0}
            color="purple"
          />
          <MetricCard
            icon={TrendingUp}
            title="Ranking"
            value="Top 10"
            trend="up"
            trendValue="+5"
            color="yellow"
          />
        </div>

        <Tabs defaultValue="keywords" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 rounded-lg">
            <TabsTrigger value="keywords" className="data-[state=active]:bg-white/20">Keywords</TabsTrigger>
            <TabsTrigger value="questions" className="data-[state=active]:bg-white/20">Questions</TabsTrigger>
            <TabsTrigger value="entities" className="data-[state=active]:bg-white/20">Entities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="keywords" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {serpData.keywords?.slice(0, 6).map((keyword: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/90">{keyword.keyword}</span>
                    <Badge variant="secondary" className="text-xs">{keyword.volume || 'N/A'}</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="questions" className="mt-4">
            <div className="space-y-3">
              {serpData.peopleAlsoAsk?.slice(0, 4).map((question: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors group"
                >
                  <p className="text-sm text-white/90 group-hover:text-white transition-colors">
                    {question.question}
                  </p>
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="entities" className="mt-4">
            <div className="flex flex-wrap gap-2">
              {serpData.entities?.slice(0, 8).map((entity: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Badge 
                    variant="outline" 
                    className="bg-white/10 border-white/20 text-white/90 hover:bg-white/20 transition-colors"
                  >
                    {entity.title}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    );
  };

  const renderDocumentStructure = () => {
    if (!documentStructure) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6 text-center"
        >
          <FileCode className="h-12 w-12 text-green-400 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-semibold text-white/80 mb-2">Document Structure</h3>
          <p className="text-sm text-white/60">No structure analysis available</p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-500/20 rounded-xl">
            <FileCode className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Document Structure</h3>
            <p className="text-sm text-white/60">Content organization and hierarchy</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard
            icon={Zap}
            title="H1 Tags"
            value={documentStructure.h1?.length || 0}
            color="green"
          />
          <MetricCard
            icon={FileText}
            title="H2 Tags"
            value={documentStructure.h2?.length || 0}
            color="blue"
          />
          <MetricCard
            icon={Tag}
            title="H3 Tags"
            value={documentStructure.h3?.length || 0}
            color="purple"
          />
          <MetricCard
            icon={BarChart2}
            title="Words"
            value={documentStructure.metadata?.wordCount || 0}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${documentStructure.hasSingleH1 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-white/90">Single H1 Tag</span>
            </div>
            <p className="text-xs text-white/60">
              {documentStructure.hasSingleH1 ? 'Properly structured' : 'Multiple H1 tags detected'}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${documentStructure.hasLogicalHierarchy ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-white/90">Logical Hierarchy</span>
            </div>
            <p className="text-xs text-white/60">
              {documentStructure.hasLogicalHierarchy ? 'Well organized' : 'Hierarchy issues found'}
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const renderSolutionIntegration = () => {
    const selectedSolution = draft.metadata?.selectedSolution;
    
    if (!selectedSolution) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 text-center"
        >
          <Puzzle className="h-12 w-12 text-purple-400 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-semibold text-white/80 mb-2">Solution Integration</h3>
          <p className="text-sm text-white/60">No solution selected for this content</p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <Puzzle className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Solution Integration</h3>
            <p className="text-sm text-white/60">{selectedSolution.name} • {selectedSolution.category}</p>
          </div>
        </div>

        {solutionMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <MetricCard
              icon={Target}
              title="Integration"
              value={`${solutionMetrics.featureIncorporation}%`}
              color="purple"
            />
            <MetricCard
              icon={TrendingUp}
              title="Positioning"
              value={`${solutionMetrics.positioningScore}%`}
              color="blue"
            />
            <MetricCard
              icon={Tag}
              title="Mentions"
              value={solutionMetrics.nameMentions}
              color="green"
            />
          </div>
        )}

        {selectedSolution.features && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h4 className="text-sm font-medium text-white/90 mb-3">Key Features</h4>
            <div className="flex flex-wrap gap-2">
              {selectedSolution.features.slice(0, 6).map((feature: string, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Badge 
                    variant="outline" 
                    className="bg-purple-500/20 border-purple-500/30 text-purple-200 hover:bg-purple-500/30 transition-colors"
                  >
                    {feature}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-white/20">
        <DialogHeader className="pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              {draft.title}
            </DialogTitle>
            <Badge 
              variant={draft.status === 'draft' ? 'outline' : 'default'}
              className={draft.status === 'draft' ? 'border-white/30 text-white/70' : 'bg-green-500/20 text-green-400'}
            >
              {draft.status === 'draft' ? 'Draft' : 'Published'}
            </Badge>
          </div>
          <DialogDescription className="text-white/60">
            Created: {formatDate(draft.created_at)}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'content' | 'metadata')} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 rounded-lg mb-4">
            <TabsTrigger 
              value="content" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger 
              value="metadata" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white flex items-center gap-2"
            >
              <Tag className="w-4 h-4" />
              Metadata
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <TabsContent value="content" className="mt-0">
              <div className="prose prose-invert max-w-none bg-white/5 rounded-xl p-6 border border-white/10">
                {draft.content ? (
                  <div dangerouslySetInnerHTML={{ __html: draft.content }} />
                ) : (
                  <p className="text-white/50 italic">No content available</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="metadata" className="mt-0 space-y-6">
              <AnimatePresence>
                {isLoadingAnalysis && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center py-12"
                  >
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
                    <span className="ml-4 text-lg text-white/70">Analyzing content...</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!isLoadingAnalysis && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  {renderSerpAnalysis()}
                  {renderSolutionIntegration()}
                  {renderDocumentStructure()}
                  
                  {/* Original metadata cards with modern styling */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <BarChart2 className="w-5 h-5 text-green-400" />
                        <h3 className="font-semibold text-white">SEO Performance</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70">SEO Score</span>
                          <span className="text-lg font-bold text-white">{draft.seo_score || 0}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              draft.seo_score >= 80 ? 'bg-green-500' : 
                              draft.seo_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${draft.seo_score || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-5 h-5 text-blue-400" />
                        <h3 className="font-semibold text-white">Timeline</h3>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/70">Created:</span>
                          <span className="text-white">{formatDate(draft.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Updated:</span>
                          <span className="text-white">{formatDate(draft.updated_at)}</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Keywords section with modern styling */}
                  {draft.keywords && draft.keywords.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 border border-white/10 rounded-xl p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Tag className="w-5 h-5 text-purple-400" />
                        <h3 className="font-semibold text-white">Target Keywords</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {draft.keywords.map((keyword: string, idx: number) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Badge 
                              variant="secondary" 
                              className="bg-white/10 border-white/20 text-white/90 hover:bg-white/20 transition-colors"
                            >
                              {keyword}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="outline" onClick={onClose} className="border-white/20 text-white/70 hover:bg-white/10">
            Close
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Draft
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
