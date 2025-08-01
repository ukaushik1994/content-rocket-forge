
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  Target,
  TrendingUp,
  Users,
  Globe,
  Clock,
  ArrowRight,
  Plus,
  Search,
  Brain,
  Lightbulb,
  FileText,
  Eye,
  Sparkles
} from 'lucide-react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';

interface SerpAnalysisPanelProps {
  keyword: string;
  serpData: any;
  isLoading: boolean;
}

export function SerpAnalysisPanel({ keyword, serpData, isLoading }: SerpAnalysisPanelProps) {
  const { state, addSerpSelections } = useContentBuilder();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleAddToBuilder = () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to add');
      return;
    }

    // Convert selected items to SERP selections format
    const selections = selectedItems.map(item => {
      const [type, content] = item.split('::');
      return { type, content };
    });

    addSerpSelections(selections);
    toast.success(`Added ${selections.length} items to Content Builder`);
    setSelectedItems([]);
  };

  const toggleSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center"
            >
              <Brain className="h-6 w-6 text-blue-400" />
            </motion.div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Analyzing SERP Data</h3>
              <p className="text-gray-400">Gathering insights for "{keyword}"...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!serpData) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
              <Search className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">No Data Available</h3>
              <p className="text-gray-400">Unable to fetch SERP data for "{keyword}"</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: 'Search Volume',
      value: serpData.searchVolume?.toLocaleString() || 'N/A',
      icon: TrendingUp,
      color: 'text-blue-400'
    },
    {
      label: 'Difficulty',
      value: serpData.keywordDifficulty || 'N/A',
      icon: Target,
      color: 'text-orange-400'
    },
    {
      label: 'Competition',
      value: serpData.competitionScore ? `${Math.round(serpData.competitionScore * 100)}%` : 'N/A',
      icon: Users,
      color: 'text-purple-400'
    },
    {
      label: 'CPC',
      value: serpData.cpc ? `$${serpData.cpc.toFixed(2)}` : 'N/A',
      icon: Globe,
      color: 'text-green-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">SERP Analysis Results</h2>
          <p className="text-gray-400">
            Analysis for <span className="text-blue-300 font-medium">"{keyword}"</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
            {selectedItems.length} selected
          </Badge>
          <Button
            onClick={handleAddToBuilder}
            disabled={selectedItems.length === 0}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Content Builder
          </Button>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {metrics.map((metric, index) => (
          <Card key={metric.label} className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg">
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{metric.label}</p>
                  <p className="text-sm font-semibold text-white">{metric.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Data Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Tabs defaultValue="questions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 backdrop-blur-md border-white/10">
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="headings">Headings</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-4">
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  People Also Ask
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {serpData.peopleAlsoAsk?.length > 0 ? (
                  serpData.peopleAlsoAsk.slice(0, 8).map((question: any, index: number) => {
                    const itemId = `question::${question.question || question}`;
                    const isSelected = selectedItems.includes(itemId);
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-blue-500/20 border-blue-500/40' 
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                        onClick={() => toggleSelection(itemId)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 p-1 rounded-full ${
                            isSelected ? 'bg-blue-500' : 'bg-white/10'
                          }`}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          <p className="text-sm text-white flex-1">
                            {question.question || question}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-center py-8">No questions found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="headings" className="space-y-4">
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5 text-teal-400" />
                  Common Headings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {serpData.headings?.length > 0 ? (
                  serpData.headings.slice(0, 10).map((heading: any, index: number) => {
                    const itemId = `heading::${heading.text || heading}`;
                    const isSelected = selectedItems.includes(itemId);
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-teal-500/20 border-teal-500/40' 
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                        onClick={() => toggleSelection(itemId)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1 rounded-full ${
                            isSelected ? 'bg-teal-500' : 'bg-white/10'
                          }`}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          <p className="text-sm text-white flex-1">
                            {heading.text || heading}
                          </p>
                          {heading.level && (
                            <Badge variant="outline" className="text-xs">
                              {heading.level.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-center py-8">No headings found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competitors" className="space-y-4">
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Target className="h-5 w-5 text-red-400" />
                  Top Competitors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {serpData.topResults?.length > 0 ? (
                  serpData.topResults.slice(0, 10).map((result: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                          #{result.position || index + 1}
                        </Badge>
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1 line-clamp-1">
                            {result.title}
                          </h4>
                          <p className="text-xs text-gray-400 mb-2">
                            {new URL(result.link || result.url || '#').hostname}
                          </p>
                          <p className="text-sm text-gray-300 line-clamp-2">
                            {result.snippet || result.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/20 hover:bg-white/10"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">No competitor data found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-4">
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  Related Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {serpData.relatedSearches?.length > 0 ? (
                    serpData.relatedSearches.slice(0, 20).map((search: any, index: number) => {
                      const keyword = search.query || search;
                      const itemId = `keyword::${keyword}`;
                      const isSelected = selectedItems.includes(itemId);
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Badge
                            className={`cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-purple-500/30 text-purple-200 border-purple-500/50'
                                : 'bg-white/5 text-gray-300 border-white/20 hover:border-purple-500/30'
                            }`}
                            onClick={() => toggleSelection(itemId)}
                          >
                            {keyword}
                          </Badge>
                        </motion.div>
                      );
                    })
                  ) : (
                    <p className="text-gray-400 text-center py-8 w-full">No related keywords found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <Button
          onClick={() => window.location.href = '/content-builder'}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-8"
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          Create Content from Analysis
        </Button>
      </motion.div>
    </div>
  );
}
