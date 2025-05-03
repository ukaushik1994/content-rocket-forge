
import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  ListFilter, 
  HelpCircle, 
  FileText, 
  List, 
  TrendingUp, 
  Link,
  Check,
  Plus,
  PlusCircle,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';

import { SerpKeywordList } from './SerpKeywordList';
import { SerpQuestionsList } from './SerpQuestionsList';
import { SerpSnippetsList } from './SerpSnippetsList';
import { SerpCompetitorsList } from './SerpCompetitorsList';
import { SerpAnalysisHeader } from './SerpAnalysisHeader';
import { SerpLoadingState } from './SerpLoadingState';
import { SerpAnalysisOverview } from './SerpAnalysisOverview';
import { SerpSelection } from '@/contexts/content-builder/types';

import { SerpAnalysisResult } from '@/services/serpApiService';

export interface SerpAnalysisPanelProps {
  serpData: SerpAnalysisResult | null;
  isLoading: boolean;
  mainKeyword: string;
  onAddToContent?: (content: string, type: string) => void;
  navigateToStep?: (step: number) => void;
}

export function SerpAnalysisPanel({ 
  serpData, 
  isLoading, 
  mainKeyword,
  onAddToContent = () => {},
  navigateToStep = () => {} // Add default function to avoid undefined errors
}: SerpAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedItems, setSelectedItems] = useState<{[key: string]: {[key: string]: boolean}}>({
    question: {},
    keyword: {},
    snippet: {},
    competitor: {},
    recommendation: {},
    structure: {},
  });
  
  // For expandable sections
  const [expandedSections, setExpandedSections] = useState({
    searchMetrics: true,
    recommendations: true,
    keywords: false,
    questions: false,
    competitors: false
  });
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Helper function to convert serpData to SerpSelection objects
  const convertToSerpSelections = (
    items: string[] | undefined, 
    type: string, 
    sourceField?: string
  ): SerpSelection[] => {
    if (!items || items.length === 0) return [];
    
    return items.map(item => ({
      type,
      content: typeof item === 'string' ? item : item,
      source: sourceField ? 'SERP Analysis' : undefined,
      selected: !!selectedItems[type]?.[typeof item === 'string' ? item : item]
    }));
  };
  
  // Toggle selection of an item
  const handleToggleSelection = (type: string, content: string) => {
    setSelectedItems(prev => {
      const newState = { ...prev };
      if (!newState[type]) newState[type] = {};
      
      // Toggle selection status
      newState[type][content] = !newState[type][content];
      
      return newState;
    });
  };
  
  // Select all items of a type
  const handleSelectAll = (type: string, items: SerpSelection[]) => {
    setSelectedItems(prev => {
      const newState = { ...prev };
      if (!newState[type]) newState[type] = {};
      
      // Set all items to selected
      items.forEach(item => {
        newState[type][item.content] = true;
      });
      
      return newState;
    });
    
    toast.success(`Selected all ${type}s`);
  };
  
  // Deselect all items of a type
  const handleDeselectAll = (type: string) => {
    setSelectedItems(prev => {
      const newState = { ...prev };
      newState[type] = {};
      return newState;
    });
    
    toast.success(`Deselected all ${type}s`);
  };
  
  // Get items by type
  const getItemsByType = (type: string): SerpSelection[] => {
    switch(type) {
      case 'keyword':
        return convertToSerpSelections(serpData?.keywords, 'keyword');
      case 'question':
        return serpData?.peopleAlsoAsk?.map(item => ({
          type: 'question',
          content: item.question,
          source: item.source,
          selected: !!selectedItems['question']?.[item.question]
        })) || [];
      case 'snippet':
        return serpData?.featuredSnippets?.map(item => ({
          type: 'snippet',
          content: item.content,
          source: item.source,
          selected: !!selectedItems['snippet']?.[item.content]
        })) || [];
      case 'competitor':
        return serpData?.topResults?.map(item => ({
          type: 'competitor',
          content: item.snippet,
          source: item.link,
          selected: !!selectedItems['competitor']?.[item.snippet]
        })) || [];
      case 'recommendation':
        return convertToSerpSelections(serpData?.recommendations, 'recommendation');
      case 'structure':
        // Create a structure array from common patterns
        const structures = [
          "H1 with numbers for higher CTR",
          "Define key terms in intro",
          "Use H2 for main categories",
          "Include comparison table",
          "End with FAQ section"
        ];
        return structures.map(item => ({
          type: 'structure',
          content: item,
          source: undefined,
          selected: !!selectedItems['structure']?.[item]
        }));
      default:
        return [];
    }
  };
  
  // Get count of selected items for each type
  const getSelectedCounts = () => {
    const counts = {
      question: 0,
      keyword: 0,
      snippet: 0,
      competitor: 0,
      recommendation: 0,
      structure: 0
    };
    
    Object.keys(selectedItems).forEach(type => {
      counts[type as keyof typeof counts] = Object.values(selectedItems[type] || {}).filter(Boolean).length;
    });
    
    return counts;
  };
  
  const selectedCounts = getSelectedCounts();
  const totalSelected = Object.values(selectedCounts).reduce((sum, count) => sum + count, 0);
  
  // Add content to editor from selected items
  const addContentFromSerp = (content: string, type: string) => {
    onAddToContent(content, type);
    toast.success(`Added ${type} to your content`);
  };
  
  // Generate and add all selected content
  const addAllSelectedToContent = () => {
    let contentToAdd = '';
    
    // Add recommendations if selected
    const selectedRecommendations = getItemsByType('recommendation').filter(item => selectedItems['recommendation']?.[item.content]);
    if (selectedRecommendations.length > 0) {
      contentToAdd += '## Content Strategy Recommendations\n';
      selectedRecommendations.forEach(item => {
        contentToAdd += `- ${item.content}\n`;
      });
      contentToAdd += '\n';
    }
    
    // Add structure if selected
    const selectedStructure = getItemsByType('structure').filter(item => selectedItems['structure']?.[item.content]);
    if (selectedStructure.length > 0) {
      contentToAdd += '## Recommended Content Structure\n';
      selectedStructure.forEach(item => {
        contentToAdd += `- ${item.content}\n`;
      });
      contentToAdd += '\n';
    }
    
    // Add keywords if selected
    const selectedKeywords = getItemsByType('keyword').filter(item => selectedItems['keyword']?.[item.content]);
    if (selectedKeywords.length > 0) {
      contentToAdd += '## Target Keywords\n';
      selectedKeywords.forEach(item => {
        contentToAdd += `- ${item.content}\n`;
      });
      contentToAdd += '\n';
    }
    
    // Add questions if selected
    const selectedQuestions = getItemsByType('question').filter(item => selectedItems['question']?.[item.content]);
    if (selectedQuestions.length > 0) {
      contentToAdd += '## Frequently Asked Questions\n\n';
      selectedQuestions.forEach(item => {
        const answer = serpData?.peopleAlsoAsk?.find(q => q.question === item.content)?.answer || 'No answer available';
        contentToAdd += `### ${item.content}\n${answer}\n\n`;
      });
    }
    
    // Add snippets if selected
    const selectedSnippets = getItemsByType('snippet').filter(item => selectedItems['snippet']?.[item.content]);
    if (selectedSnippets.length > 0) {
      contentToAdd += '## Featured Content\n\n';
      selectedSnippets.forEach(item => {
        contentToAdd += `${item.content}\n\n`;
      });
    }
    
    // Add competitors if selected
    const selectedCompetitors = getItemsByType('competitor').filter(item => selectedItems['competitor']?.[item.content]);
    if (selectedCompetitors.length > 0) {
      contentToAdd += '## Competitor Research\n\n';
      selectedCompetitors.forEach(item => {
        const competitor = serpData?.topResults?.find(r => r.snippet === item.content);
        contentToAdd += `### ${competitor?.title || 'Competitor'}\n${item.content}\n[Source](${item.source})\n\n`;
      });
    }
    
    // Add content to editor
    if (contentToAdd) {
      onAddToContent(contentToAdd, 'allSelected');
      toast.success('Added all selected items to your content');
    } else {
      toast.error('No items selected');
    }
  };
  
  if (isLoading) {
    return <SerpLoadingState isLoading={true} navigateToStep={navigateToStep} />;
  }

  if (!serpData) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-96 bg-gradient-to-b from-white/5 to-white/0 rounded-xl border border-white/10 backdrop-blur-md"
      >
        <Search className="h-16 w-16 text-primary/20 mb-4" />
        <h3 className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">No Analysis Data</h3>
        <p className="text-muted-foreground mt-2 mb-6 text-center max-w-md">
          Start the SERP analysis to get insights and recommendations for your content
        </p>
        <Button className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300">
          <Search className="h-4 w-4 mr-2" />
          Start Analysis
        </Button>
      </motion.div>
    );
  }

  // Animated section header component
  const SectionHeader = ({ 
    title, 
    expanded, 
    onToggle,
    count = 0,
    variant = 'default'
  }: { 
    title: string; 
    expanded: boolean; 
    onToggle: () => void;
    count?: number;
    variant?: 'default' | 'purple' | 'blue' | 'green';
  }) => {
    // Get gradient based on variant
    const getGradient = () => {
      switch(variant) {
        case 'purple':
          return 'from-purple-500/20 to-purple-800/5';
        case 'blue':
          return 'from-blue-500/20 to-blue-800/5';
        case 'green':
          return 'from-green-500/20 to-green-800/5';
        default:
          return 'from-primary/20 to-primary/5';
      }
    };
    
    return (
      <motion.div 
        className={`flex items-center justify-between py-3 px-4 rounded-lg backdrop-blur-md cursor-pointer mb-4
          bg-gradient-to-br ${getGradient()} border border-white/10 hover:shadow-lg transition-all duration-300`}
        onClick={onToggle}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            animate={{ rotate: expanded ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </motion.div>
          <h3 className="text-lg font-medium">{title}</h3>
          {count > 0 && (
            <Badge className="ml-2 bg-white/10 hover:bg-white/20">{count}</Badge>
          )}
        </div>
        <motion.div
          animate={{ rotateZ: expanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header with Search Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 p-5 rounded-xl border border-white/10 backdrop-blur-xl shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/20 rounded-full">
            <Search className="text-primary h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-xl">
              Analysis for: <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">{mainKeyword}</span>
            </h3>
            <p className="text-sm text-muted-foreground">Select items to include in your content outline</p>
          </div>
        </div>
        
        <SectionHeader 
          title="Search Metrics" 
          expanded={expandedSections.searchMetrics}
          onToggle={() => toggleSection('searchMetrics')}
          variant="blue"
        />
        
        <AnimatePresence>
          {expandedSections.searchMetrics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-md p-4 backdrop-blur-md"
                >
                  <div className="text-sm text-muted-foreground mb-1">Search Volume</div>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
                      {serpData.searchVolume?.toLocaleString() || 'N/A'}
                    </div>
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/5 border border-white/10 rounded-md p-4 backdrop-blur-md"
                >
                  <div className="text-sm text-muted-foreground mb-1">Keyword Difficulty</div>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                      {serpData.keywordDifficulty ? `${serpData.keywordDifficulty}/100` : 'N/A'}
                    </div>
                    <div className="w-16">
                      {serpData.keywordDifficulty && (
                        <div className="relative w-full h-2 bg-blue-900/30 rounded-full overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                            style={{ width: `${serpData.keywordDifficulty}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/5 border border-white/10 rounded-md p-4 backdrop-blur-md"
                >
                  <div className="text-sm text-muted-foreground mb-1">Competition</div>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
                      {serpData.competitionScore ? `${(serpData.competitionScore * 100).toFixed(0)}%` : 'N/A'}
                    </div>
                    <div className="w-16">
                      {serpData.competitionScore && (
                        <div className="relative w-full h-2 bg-green-900/30 rounded-full overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                            style={{ width: `${serpData.competitionScore * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Content Recommendations */}
      <div className="space-y-4">
        <SectionHeader 
          title="Strategy Recommendations" 
          expanded={expandedSections.recommendations}
          onToggle={() => toggleSection('recommendations')}
          variant="purple"
          count={selectedCounts.recommendation + selectedCounts.structure}
        />
        
        <AnimatePresence>
          {expandedSections.recommendations && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Content Strategy */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  <Card className="border border-purple-500/20 shadow-lg bg-gradient-to-br from-purple-900/20 via-black/20 to-black/30 backdrop-blur-md overflow-hidden group">
                    <CardHeader className="bg-gradient-to-r from-purple-500/10 to-purple-800/10 pb-3 border-b border-purple-500/10">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-md flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-400" />
                          <span>Content Strategy</span>
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-xs hover:bg-purple-500/20"
                            onClick={() => handleSelectAll('recommendation', getItemsByType('recommendation'))}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Select All
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-xs hover:bg-purple-500/20"
                            onClick={() => handleDeselectAll('recommendation')}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {serpData.recommendations?.map((recommendation, index) => (
                          <motion.div 
                            key={index} 
                            className="flex items-start gap-2"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="mt-0.5">
                              <div 
                                className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors
                                  ${selectedItems.recommendation?.[recommendation] 
                                    ? 'bg-purple-500 border-purple-500 text-white' 
                                    : 'border-white/20 hover:border-purple-400'
                                  }`}
                                onClick={() => handleToggleSelection('recommendation', recommendation)}
                              >
                                {selectedItems.recommendation?.[recommendation] && (
                                  <Check className="h-3 w-3" />
                                )}
                              </div>
                            </div>
                            <p 
                              className="text-sm cursor-pointer hover:text-purple-300 transition-colors"
                              onClick={() => handleToggleSelection('recommendation', recommendation)}
                            >
                              {recommendation}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                {/* Common Structure */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <Card className="border border-green-500/20 shadow-lg bg-gradient-to-br from-green-900/20 via-black/20 to-black/30 backdrop-blur-md overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-800/10 pb-3 border-b border-green-500/10">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-md flex items-center gap-2">
                          <List className="h-4 w-4 text-green-400" />
                          <span>Content Structure</span>
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-xs hover:bg-green-500/20"
                            onClick={() => handleSelectAll('structure', getItemsByType('structure'))}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Select All
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-xs hover:bg-green-500/20"
                            onClick={() => handleDeselectAll('structure')}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {getItemsByType('structure').map((item, index) => (
                          <motion.div 
                            key={index} 
                            className="flex items-start gap-2"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="mt-0.5">
                              <div 
                                className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors
                                  ${selectedItems.structure?.[item.content] 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-white/20 hover:border-green-400'
                                  }`}
                                onClick={() => handleToggleSelection('structure', item.content)}
                              >
                                {selectedItems.structure?.[item.content] && (
                                  <Check className="h-3 w-3" />
                                )}
                              </div>
                            </div>
                            <p 
                              className="text-sm cursor-pointer hover:text-green-300 transition-colors"
                              onClick={() => handleToggleSelection('structure', item.content)}
                            >
                              {item.content}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Elements by Tab */}
      <Tabs 
        defaultValue="keywords" 
        className="w-full bg-gradient-to-br from-black/40 to-black/20 p-5 rounded-xl border border-white/10 backdrop-blur-xl shadow-xl"
      >
        {/* Tab Header */}
        <div className="mb-6">
          <h3 className="font-medium text-lg mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
              Content Elements
            </span>
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select specific elements to include in your content
          </p>
          
          <TabsList className="w-full flex overflow-x-auto scrollbar-none p-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg">
            <TabsTrigger 
              value="keywords" 
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-800/40 data-[state=active]:to-blue-600/20 data-[state=active]:text-white"
            >
              Keywords
              {selectedCounts.keyword > 0 && (
                <Badge className="ml-2 bg-blue-500/40 hover:bg-blue-500/60 text-white border-none">
                  {selectedCounts.keyword}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="questions"
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-800/40 data-[state=active]:to-purple-600/20 data-[state=active]:text-white"
            >
              Questions
              {selectedCounts.question > 0 && (
                <Badge className="ml-2 bg-purple-500/40 hover:bg-purple-500/60 text-white border-none">
                  {selectedCounts.question}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="snippets"
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-800/40 data-[state=active]:to-green-600/20 data-[state=active]:text-white"
            >
              Snippets
              {selectedCounts.snippet > 0 && (
                <Badge className="ml-2 bg-green-500/40 hover:bg-green-500/60 text-white border-none">
                  {selectedCounts.snippet}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="competitors"
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-800/40 data-[state=active]:to-amber-600/20 data-[state=active]:text-white"
            >
              Competitors
              {selectedCounts.competitor > 0 && (
                <Badge className="ml-2 bg-amber-500/40 hover:bg-amber-500/60 text-white border-none">
                  {selectedCounts.competitor}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Tab Content */}
        <TabsContent value="keywords" className="space-y-4 mt-2">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-medium flex items-center gap-2">
              <Search className="h-4 w-4 text-blue-400" />
              Target Keywords
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/20"
                onClick={() => handleSelectAll('keyword', getItemsByType('keyword'))}
              >
                <Check className="h-3 w-3 mr-1" />
                Select All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/20"
                onClick={() => handleDeselectAll('keyword')}
              >
                Clear
              </Button>
            </div>
          </div>
          <SerpKeywordList 
            keywords={getItemsByType('keyword')} 
            handleToggleSelection={handleToggleSelection} 
          />
        </TabsContent>
        
        <TabsContent value="questions" className="space-y-4 mt-2">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-medium flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-purple-400" />
              People Also Ask
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/20"
                onClick={() => handleSelectAll('question', getItemsByType('question'))}
              >
                <Check className="h-3 w-3 mr-1" />
                Select All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/20"
                onClick={() => handleDeselectAll('question')}
              >
                Clear
              </Button>
            </div>
          </div>
          <SerpQuestionsList 
            questions={getItemsByType('question')} 
            handleToggleSelection={handleToggleSelection} 
          />
        </TabsContent>
        
        <TabsContent value="snippets" className="space-y-4 mt-2">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-400" />
              Featured Snippets
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs border-green-500/30 hover:border-green-500/60 hover:bg-green-500/20"
                onClick={() => handleSelectAll('snippet', getItemsByType('snippet'))}
              >
                <Check className="h-3 w-3 mr-1" />
                Select All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs border-green-500/30 hover:border-green-500/60 hover:bg-green-500/20"
                onClick={() => handleDeselectAll('snippet')}
              >
                Clear
              </Button>
            </div>
          </div>
          <SerpSnippetsList 
            snippets={getItemsByType('snippet')} 
            handleToggleSelection={handleToggleSelection}
            addContentFromSerp={addContentFromSerp}
          />
        </TabsContent>
        
        <TabsContent value="competitors" className="space-y-4 mt-2">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-medium flex items-center gap-2">
              <Link className="h-4 w-4 text-amber-400" />
              Top Competitors
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/20"
                onClick={() => handleSelectAll('competitor', getItemsByType('competitor'))}
              >
                <Check className="h-3 w-3 mr-1" />
                Select All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/20"
                onClick={() => handleDeselectAll('competitor')}
              >
                Clear
              </Button>
            </div>
          </div>
          <SerpCompetitorsList 
            competitors={getItemsByType('competitor')} 
            handleToggleSelection={handleToggleSelection} 
          />
        </TabsContent>
      </Tabs>
      
      {/* Selected Items Summary */}
      {totalSelected > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-primary/30 rounded-xl p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-xl shadow-lg"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Selected Items ({totalSelected})
            </h3>
            <Button 
              onClick={addAllSelectedToContent}
              disabled={totalSelected === 0}
              className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Content
            </Button>
          </div>
          
          <div className="space-y-4">
            {selectedCounts.recommendation > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium">Recommendations ({selectedCounts.recommendation})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedItems.recommendation || {})
                    .filter(([_, selected]) => selected)
                    .map(([content], i) => (
                      <Badge key={i} variant="outline" className="bg-purple-900/30 border-purple-500/30 flex items-center gap-1">
                        {content.length > 40 ? content.substring(0, 40) + '...' : content}
                        <button 
                          onClick={() => handleToggleSelection('recommendation', content)}
                          className="ml-1 text-red-400 hover:text-red-300 rounded-full p-0.5"
                        >
                          ✕
                        </button>
                      </Badge>
                    ))}
                </div>
              </div>
            )}
            
            {selectedCounts.structure > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Structure ({selectedCounts.structure})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedItems.structure || {})
                    .filter(([_, selected]) => selected)
                    .map(([content], i) => (
                      <Badge key={i} variant="outline" className="bg-green-900/30 border-green-500/30 flex items-center gap-1">
                        {content.length > 40 ? content.substring(0, 40) + '...' : content}
                        <button 
                          onClick={() => handleToggleSelection('structure', content)}
                          className="ml-1 text-red-400 hover:text-red-300 rounded-full p-0.5"
                        >
                          ✕
                        </button>
                      </Badge>
                    ))}
                </div>
              </div>
            )}
            
            {selectedCounts.keyword > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Keywords ({selectedCounts.keyword})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedItems.keyword || {})
                    .filter(([_, selected]) => selected)
                    .map(([content], i) => (
                      <Badge key={i} variant="outline" className="bg-blue-900/30 border-blue-500/30 flex items-center gap-1">
                        {content}
                        <button 
                          onClick={() => handleToggleSelection('keyword', content)}
                          className="ml-1 text-red-400 hover:text-red-300 rounded-full p-0.5"
                        >
                          ✕
                        </button>
                      </Badge>
                    ))}
                </div>
              </div>
            )}
            
            {selectedCounts.question > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium">Questions ({selectedCounts.question})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedItems.question || {})
                    .filter(([_, selected]) => selected)
                    .map(([content], i) => (
                      <Badge key={i} variant="outline" className="bg-purple-900/30 border-purple-500/30 flex items-center gap-1">
                        {content.length > 40 ? content.substring(0, 40) + '...' : content}
                        <button 
                          onClick={() => handleToggleSelection('question', content)}
                          className="ml-1 text-red-400 hover:text-red-300 rounded-full p-0.5"
                        >
                          ✕
                        </button>
                      </Badge>
                    ))}
                </div>
              </div>
            )}
            
            {selectedCounts.snippet > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Snippets ({selectedCounts.snippet})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedItems.snippet || {})
                    .filter(([_, selected]) => selected)
                    .map(([content], i) => (
                      <Badge key={i} variant="outline" className="bg-green-900/30 border-green-500/30 flex items-center gap-1">
                        {content.length > 40 ? content.substring(0, 40) + '...' : content}
                        <button 
                          onClick={() => handleToggleSelection('snippet', content)}
                          className="ml-1 text-red-400 hover:text-red-300 rounded-full p-0.5"
                        >
                          ✕
                        </button>
                      </Badge>
                    ))}
                </div>
              </div>
            )}
            
            {selectedCounts.competitor > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-sm font-medium">Competitors ({selectedCounts.competitor})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedItems.competitor || {})
                    .filter(([_, selected]) => selected)
                    .map(([content], i) => (
                      <Badge key={i} variant="outline" className="bg-amber-900/30 border-amber-500/30 flex items-center gap-1">
                        {content.length > 40 ? content.substring(0, 40) + '...' : content}
                        <button 
                          onClick={() => handleToggleSelection('competitor', content)}
                          className="ml-1 text-red-400 hover:text-red-300 rounded-full p-0.5"
                        >
                          ✕
                        </button>
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
