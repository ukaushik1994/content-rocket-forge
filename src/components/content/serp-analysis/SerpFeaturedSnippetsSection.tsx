
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SerpAnalysisResult } from '@/types/serp';

interface SerpFeaturedSnippetsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpFeaturedSnippetsSection({ 
  serpData, 
  expanded, 
  onAddToContent = () => {} 
}: SerpFeaturedSnippetsSectionProps) {
  const [expandedSnippets, setExpandedSnippets] = useState<Set<number>>(new Set());
  
  console.log('🔍 Featured Snippets Section Debug:', {
    expanded,
    hasFeaturedSnippets: !!serpData?.featuredSnippets,
    featuredSnippetsLength: serpData?.featuredSnippets?.length || 0,
    firstSnippet: serpData?.featuredSnippets?.[0],
    allSnippets: serpData?.featuredSnippets
  });
  
  if (!expanded) return null;
  
  if (!serpData?.featuredSnippets?.length) {
    console.log('❌ No featured snippets data found:', serpData?.featuredSnippets);
    return (
      <div className="p-4 text-center text-white/50">
        <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No featured snippets found for this keyword</p>
        <p className="text-xs mt-1">Featured snippets provide great opportunities for ranking</p>
        <div className="text-xs mt-2 opacity-50">
          Debug: {serpData?.featuredSnippets ? `Array with ${serpData.featuredSnippets.length} items` : 'No featuredSnippets data'}
        </div>
      </div>
    );
  }
  
  const toggleSnippet = (index: number) => {
    const newExpanded = new Set(expandedSnippets);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSnippets(newExpanded);
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const getSnippetTypeColor = (type: string) => {
    switch (type) {
      case 'paragraph': return 'bg-green-500/20 text-green-300';
      case 'list': return 'bg-orange-500/20 text-orange-300';
      case 'table': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-3 py-4"
    >
      {serpData.featuredSnippets.map((snippet, index) => {
        // Add validation for snippet data structure
        if (!snippet || typeof snippet !== 'object') {
          console.warn('⚠️ Invalid snippet data at index', index, snippet);
          return null;
        }

        const content = snippet.content || '';
        const type = snippet.type || 'paragraph';
        const title = snippet.title || '';
        const source = snippet.source || 'Search results';

        if (!content) {
          console.warn('⚠️ Empty snippet content at index', index, snippet);
          return null;
        }

        return (
          <motion.div key={`snippet-${index}`} variants={item}>
            <Card className="bg-green-900/10 border-green-500/20 hover:border-green-500/40 transition-all">
              <CardContent className="p-0">
                {/* Snippet Header */}
                <div 
                  className="p-4 flex justify-between items-start cursor-pointer hover:bg-green-900/5 transition-colors"
                  onClick={() => toggleSnippet(index)}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <Target className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-xs ${getSnippetTypeColor(type)}`}>
                          {type}
                        </Badge>
                        <span className="text-xs text-green-400/70">Featured Snippet Opportunity</span>
                      </div>
                      {title && (
                        <p className="font-medium text-sm text-white/90 mb-1">{title}</p>
                      )}
                      <p className="text-xs text-green-400/70">
                        Source: {source}
                        <ExternalLink className="h-3 w-3 inline ml-1" />
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-green-400 hover:text-green-300 hover:bg-green-900/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToContent(content, 'featuredSnippet');
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-green-400 hover:text-green-300 hover:bg-green-900/20"
                    >
                      {expandedSnippets.has(index) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Snippet Content */}
                <AnimatePresence>
                  {expandedSnippets.has(index) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pl-12 border-t border-green-500/10">
                        <div className="pt-3">
                          <div className="bg-green-500/10 rounded p-3 mb-3">
                            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                              {content}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-3 text-xs border-green-500/30 text-green-300 hover:bg-green-900/20 hover:border-green-500/50"
                              onClick={() => onAddToContent(content, 'featuredSnippet')}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Use This Format
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-3 text-xs border-green-500/30 text-green-300 hover:bg-green-900/20 hover:border-green-500/50"
                              onClick={() => onAddToContent(`Optimize for ${type} snippet format`, 'snippetStrategy')}
                            >
                              <Target className="h-3 w-3 mr-1" />
                              Target This
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
