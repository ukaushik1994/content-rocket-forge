
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SerpSelection } from '@/contexts/content-builder/types';
import { Tag, Plus, Check, TrendingUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KeywordsTabProps {
  keywords: string[];
  relatedSearches: any[];
  serpSelections: SerpSelection[];
  onToggleSelection: (type: string, content: string) => void;
}

export function KeywordsTab({ keywords, relatedSearches, serpSelections, onToggleSelection }: KeywordsTabProps) {
  const isSelected = (keyword: string, type: string) => {
    return serpSelections.some(
      item => (item.type === type || item.type === 'keyword') && 
               item.content === keyword && 
               item.selected
    );
  };

  const renderKeywordItem = (keyword: string, type: string, volume?: number, index?: number) => {
    const selected = isSelected(keyword, type);
    
    return (
      <motion.div
        key={`${type}-${index}-${keyword}`}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ delay: (index || 0) * 0.05, duration: 0.4 }}
        whileHover={{ scale: 1.02, y: -1 }}
        className="group"
      >
        <Card className={`relative overflow-hidden transition-all duration-300 ${
          selected 
            ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30 shadow-lg shadow-indigo-500/10' 
            : 'bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-white/10 hover:border-white/20'
        } backdrop-blur-xl`}>
          
          {/* Animated selection indicator */}
          {selected && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          
          {/* Floating particles for selected items */}
          {selected && (
            <>
              <div className="absolute top-2 right-2 w-1 h-1 bg-indigo-400 rounded-full animate-pulse" />
              <div className="absolute bottom-2 left-2 w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          )}
          
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg backdrop-blur-sm border transition-all duration-300 ${
                  selected 
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/30' 
                    : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-white/20'
                }`}>
                  <Tag className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-white truncate block">{keyword}</span>
                </div>
                <div className="flex items-center gap-2">
                  {volume && (
                    <Badge className="text-xs bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30 font-mono">
                      {volume >= 1000 ? `${Math.round(volume/1000)}K` : volume}
                    </Badge>
                  )}
                  {selected && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3 text-indigo-400" />
                    </motion.div>
                  )}
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={selected ? "default" : "outline"}
                  size="sm"
                  onClick={() => onToggleSelection(type, keyword)}
                  className={`transition-all duration-300 ${
                    selected
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30 backdrop-blur-sm'
                  }`}
                >
                  {selected ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      <span className="hidden sm:inline">Selected</span>
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Plus className="h-3 w-3" />
                      <span className="hidden sm:inline">Select</span>
                    </div>
                  )}
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (keywords.length === 0 && relatedSearches.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-20 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-xl" />
          <div className="relative p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full backdrop-blur-sm border border-white/10">
            <Tag className="h-12 w-12 text-indigo-400" />
          </div>
        </div>
        <h3 className="text-xl font-medium mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          No keywords found
        </h3>
        <p className="text-gray-400 max-w-md">
          No additional keywords or related searches were found for this analysis
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Keywords */}
      {keywords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5" />
            
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg backdrop-blur-sm border border-white/10">
                  <Tag className="h-5 w-5 text-indigo-400" />
                </div>
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Primary Keywords
                </span>
                <Badge className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/30 font-mono">
                  {keywords.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <div className="space-y-3">
                <AnimatePresence>
                  {keywords.map((keyword, index) => 
                    renderKeywordItem(keyword, 'keyword', undefined, index)
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Related Searches */}
      {relatedSearches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5" />
            
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg backdrop-blur-sm border border-white/10">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Related Searches
                </span>
                <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30 font-mono">
                  {relatedSearches.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <div className="space-y-3">
                <AnimatePresence>
                  {relatedSearches.map((search, index) => {
                    const searchText = typeof search === 'string' ? search : search.query;
                    const searchVolume = typeof search === 'object' ? search.volume : undefined;
                    return renderKeywordItem(searchText, 'relatedSearch', searchVolume, index);
                  })}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
