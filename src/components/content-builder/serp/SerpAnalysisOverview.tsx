
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SerpAnalysisResult } from '@/services/serpApiService';
import { SerpSelection } from '@/contexts/content-builder/types';
import { TrendingUp, Search, HelpCircle, FileText, X } from 'lucide-react';

interface SerpAnalysisOverviewProps {
  serpData: SerpAnalysisResult;
  selectedCounts: {
    question: number;
    keyword: number;
    snippet: number;
    competitor: number;
  };
  totalSelected: number;
  getItemsByType: (type: string) => SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
}

export const SerpAnalysisOverview: React.FC<SerpAnalysisOverviewProps> = ({
  serpData,
  selectedCounts,
  totalSelected,
  getItemsByType,
  handleToggleSelection
}) => {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        <motion.div variants={fadeInUp} className="h-full">
          <Card className="overflow-hidden bg-gradient-to-br from-blue-900/10 to-purple-900/10 border border-white/10 backdrop-blur-lg h-full shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2 bg-gradient-to-r from-blue-900/20 to-blue-900/5 border-b border-white/10">
              <CardTitle className="text-md flex items-center gap-2">
                <Search className="h-4 w-4 text-blue-400" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
                  Keyword Overview
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <motion.div 
                variants={container}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                <motion.div variants={item} className="flex justify-between items-center group">
                  <span className="text-sm text-muted-foreground">Search Volume:</span>
                  <span className="font-medium text-blue-300">{serpData.searchVolume ? serpData.searchVolume.toLocaleString() : 'N/A'}</span>
                </motion.div>
                <motion.div variants={item} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Difficulty:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                        style={{ width: `${serpData.keywordDifficulty || 0}%` }}
                      />
                    </div>
                    <span className="font-medium text-blue-300">{serpData.keywordDifficulty || 'N/A'}</span>
                  </div>
                </motion.div>
                <motion.div variants={item} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Competition:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                        style={{ width: `${(serpData.competitionScore || 0) * 100}%` }}
                      />
                    </div>
                    <span className="font-medium text-blue-300">
                      {serpData.competitionScore ? `${(serpData.competitionScore * 100).toFixed(0)}%` : 'N/A'}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={fadeInUp} className="h-full">
          <Card className="overflow-hidden bg-gradient-to-br from-purple-900/10 to-blue-900/10 border border-white/10 backdrop-blur-lg h-full shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2 bg-gradient-to-r from-purple-900/20 to-purple-900/5 border-b border-white/10">
              <CardTitle className="text-md flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-200">
                  Content Recommendations
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {serpData.recommendations && serpData.recommendations.length > 0 ? (
                <motion.ul 
                  variants={container}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2"
                >
                  {serpData.recommendations.map((recommendation, index) => (
                    <motion.li 
                      key={index} 
                      variants={item}
                      className="text-sm flex items-start gap-2"
                    >
                      <div className="min-w-5 h-5 rounded-full bg-gradient-to-r from-purple-600/30 to-blue-600/30 flex items-center justify-center text-xs mt-0.5">
                        {index + 1}
                      </div>
                      <span>{recommendation}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              ) : (
                <p className="text-sm text-muted-foreground">No recommendations available.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      
      <motion.div 
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mt-6"
      >
        <Card className="overflow-hidden bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-blue-900/10 border border-white/10 backdrop-blur-lg shadow-xl">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-900/20 via-purple-900/10 to-blue-900/5 border-b border-white/10">
            <div className="flex justify-between items-center">
              <CardTitle className="text-md flex items-center gap-2">
                <div className="p-1 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20">
                  <Badge variant="outline" className="h-5 w-5 flex items-center justify-center p-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                    {totalSelected}
                  </Badge>
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
                  Selected Items
                </span>
              </CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4">
            {totalSelected > 0 ? (
              <motion.div 
                variants={container}
                initial="hidden"
                animate="visible"
                className="space-y-5"
              >
                {selectedCounts.question > 0 && (
                  <motion.div variants={item}>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
                      <span>Questions ({selectedCounts.question})</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {getItemsByType('question').filter(item => item.selected).map((item, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="flex items-center gap-1 py-1.5 pl-3 pr-2 bg-purple-900/20 border-purple-500/30 text-purple-200 hover:bg-purple-900/30 transition-colors group"
                        >
                          {item.content.length > 50 ? item.content.substring(0, 50) + '...' : item.content}
                          <button 
                            onClick={() => handleToggleSelection(item.type, item.content)}
                            className="ml-1 text-purple-400 hover:text-red-400 hover:bg-white/10 rounded-full p-0.5 transition-colors"
                            aria-label="Remove item"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {selectedCounts.keyword > 0 && (
                  <motion.div variants={item}>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Search className="h-3.5 w-3.5 text-blue-400" />
                      <span>Keywords ({selectedCounts.keyword})</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {getItemsByType('keyword').filter(item => item.selected).map((item, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="flex items-center gap-1 py-1.5 pl-3 pr-2 bg-blue-900/20 border-blue-500/30 text-blue-200 hover:bg-blue-900/30 transition-colors"
                        >
                          {item.content}
                          <button 
                            onClick={() => handleToggleSelection(item.type, item.content)}
                            className="ml-1 text-blue-400 hover:text-red-400 hover:bg-white/10 rounded-full p-0.5 transition-colors"
                            aria-label="Remove item"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {selectedCounts.snippet > 0 && (
                  <motion.div variants={item}>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-green-400" />
                      <span>Snippets ({selectedCounts.snippet})</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {getItemsByType('snippet').filter(item => item.selected).map((item, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="flex items-center gap-1 py-1.5 pl-3 pr-2 bg-green-900/20 border-green-500/30 text-green-200 hover:bg-green-900/30 transition-colors"
                        >
                          {item.content.length > 50 ? item.content.substring(0, 50) + '...' : item.content}
                          <button 
                            onClick={() => handleToggleSelection(item.type, item.content)}
                            className="ml-1 text-green-400 hover:text-red-400 hover:bg-white/10 rounded-full p-0.5 transition-colors"
                            aria-label="Remove item"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                className="text-center py-8 rounded-lg bg-white/5 border border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-sm text-muted-foreground">
                  No items selected yet. Browse through the tabs below to select content for your outline.
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
