import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, PlusCircle, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { SerpAnalysisResult } from '@/services/serpApiService';
import { SerpActionButton } from './SerpActionButton';

interface SerpKeywordsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent: (content: string, type: string) => void;
}

export function SerpKeywordsSection({
  serpData,
  expanded,
  onAddToContent
}: SerpKeywordsSectionProps) {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  
  if (!expanded || !serpData.relatedSearches || serpData.relatedSearches.length === 0) return null;
  
  const toggleKeywordSelection = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
      toast.success(`Added "${keyword}" to selection`);
    }
  };
  
  const addSelectedKeywords = () => {
    if (selectedKeywords.length === 0) {
      toast.error("No keywords selected");
      return;
    }
    
    const keywordsText = selectedKeywords.join('\n- ');
    onAddToContent(`## Selected Keywords\n- ${keywordsText}\n\n`, 'selectedKeywords');
    toast.success(`Added ${selectedKeywords.length} keywords to your content`);
  };
  
  // Filter keywords based on volume (if available)
  const getFilteredKeywords = () => {
    if (filter === 'all') return serpData.relatedSearches || [];
    
    return (serpData.relatedSearches || []).filter(item => {
      const volume = item.volume || 0;
      
      if (filter === 'high') return volume > 1000;
      if (filter === 'medium') return volume >= 500 && volume <= 1000;
      if (filter === 'low') return volume < 500;
      
      return true;
    });
  };
  
  const filteredKeywords = getFilteredKeywords();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-5"
    >
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter by volume:</span>
        </div>
        
        <div className="flex rounded-lg bg-white/5 p-1">
          {(['all', 'high', 'medium', 'low'] as const).map(option => (
            <Button
              key={option}
              variant="ghost"
              size="sm"
              className={`text-xs px-2 py-1 h-7 ${filter === option ? 'bg-white/10' : ''}`}
              onClick={() => setFilter(option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Selected counter */}
      {selectedKeywords.length > 0 && (
        <div className="bg-gradient-to-r from-blue-800/30 to-purple-800/30 p-2 rounded-lg flex justify-between items-center">
          <span className="text-sm">
            <span className="text-primary font-medium">{selectedKeywords.length}</span> keywords selected
          </span>
          <Button
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs"
            onClick={() => setSelectedKeywords([])}
          >
            Clear
          </Button>
        </div>
      )}
      
      {/* Keywords */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap gap-2 mb-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredKeywords.map((item, index) => (
            <motion.div
              layout
              key={item.query}
              variants={itemVariants}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ 
                type: "spring",
                stiffness: 500, 
                damping: 30
              }}
            >
              <Badge 
                className={`
                  cursor-pointer transition-all duration-300 px-3 py-1.5
                  ${selectedKeywords.includes(item.query)
                    ? 'bg-blue-500/50 hover:bg-blue-500/40 text-white border-blue-400/50'
                    : 'bg-gradient-to-r from-blue-800/40 to-purple-800/40 border border-white/10 hover:from-blue-800/60 hover:to-purple-800/60'
                  }
                `}
                onClick={() => toggleKeywordSelection(item.query)}
              >
                <div className="flex items-center gap-2">
                  {item.query}
                  {item.volume && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      selectedKeywords.includes(item.query) 
                        ? 'bg-white/20' 
                        : 'bg-white/10'
                    }`}>
                      {item.volume}
                    </span>
                  )}
                </div>
              </Badge>
            </motion.div>
          ))}
          
          {filteredKeywords.length === 0 && (
            <div className="w-full py-4 text-center text-muted-foreground">
              No keywords match the current filter
            </div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <div className="flex flex-col gap-2">
        <SerpActionButton
          onClick={addSelectedKeywords}
          className={`${selectedKeywords.length === 0 ? 'opacity-50' : ''}`}
          variant="outline"
          icon={<PlusCircle className="h-4 w-4 mr-2" />}
          disabled={selectedKeywords.length === 0}
          actionType="add"
        >
          Add {selectedKeywords.length} Selected Keywords
        </SerpActionButton>
        
        <SerpActionButton
          variant="outline"
          onClick={() => {
            const relatedSearchesText = serpData.relatedSearches?.map(item => 
              `- ${item.query}${item.volume ? ` (${item.volume} searches/month)` : ''}`
            ).join('\n') || '';
            onAddToContent(`## Related Searches\n${relatedSearchesText}\n\n`, 'relatedSearches');
            toast.success('Added all related searches');
          }}
          className="mt-2"
          icon={<Search className="h-4 w-4 mr-2" />}
          actionType="add"
        >
          Add All Related Searches
        </SerpActionButton>
      </div>
    </motion.div>
  );
}
