
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, ChevronDown, ChevronRight, ExternalLink, AlertTriangle } from 'lucide-react';
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
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Always call all hooks - Enhanced debugging with data validation
  const debugInfo = useMemo(() => {
    const info = {
      hasData: !!serpData,
      hasFeaturedSnippets: !!serpData?.featuredSnippets,
      featuredSnippetsType: typeof serpData?.featuredSnippets,
      featuredSnippetsLength: Array.isArray(serpData?.featuredSnippets) ? serpData.featuredSnippets.length : 'not array',
      firstSnippetStructure: serpData?.featuredSnippets?.[0] ? Object.keys(serpData.featuredSnippets[0]) : 'no first item',
      validSnippets: 0,
      invalidSnippets: 0,
      sampleData: serpData?.featuredSnippets?.slice(0, 2) || []
    };
    
    // Count valid vs invalid snippets
    if (Array.isArray(serpData?.featuredSnippets)) {
      serpData.featuredSnippets.forEach(snippet => {
        if (snippet && typeof snippet === 'object' && snippet.content) {
          info.validSnippets++;
        } else {
          info.invalidSnippets++;
        }
      });
    }
    
    return info;
  }, [serpData]);
  
  // Validate and filter snippets - always call this hook
  const validSnippets = useMemo(() => {
    if (!Array.isArray(serpData?.featuredSnippets)) {
      console.warn('❌ featuredSnippets is not an array:', typeof serpData?.featuredSnippets);
      return [];
    }
    
    return serpData.featuredSnippets.filter((snippet, index) => {
      if (!snippet || typeof snippet !== 'object') {
        console.warn(`⚠️ Invalid snippet at index ${index}:`, snippet);
        return false;
      }
      
      if (!snippet.content || typeof snippet.content !== 'string') {
        console.warn(`⚠️ Missing or invalid content at index ${index}:`, snippet);
        return false;
      }
      
      return true;
    });
  }, [serpData?.featuredSnippets]);
  
  console.log('🔍 Featured Snippets Section Enhanced Debug:', debugInfo);
  
  // Early return after all hooks have been called
  if (!expanded) return null;
  
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
      case 'dictionary_results': return 'bg-blue-500/20 text-blue-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  // Show empty state with debugging info
  if (validSnippets.length === 0) {
    return (
      <div className="p-4 text-center text-white/50">
        <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No valid featured snippets found for this keyword</p>
        <p className="text-xs mt-1">Featured snippets provide great opportunities for ranking</p>
        
        {/* Debug information panel */}
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-xs text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-red-400">Debug Information</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="h-6 px-2 text-xs text-red-400"
            >
              {showDebugInfo ? 'Hide' : 'Show'} Details
            </Button>
          </div>
          
          <div className="space-y-1 text-red-300/80">
            <div>Data Present: {debugInfo.hasData ? '✅' : '❌'}</div>
            <div>FeaturedSnippets: {debugInfo.hasFeaturedSnippets ? '✅' : '❌'}</div>
            <div>Type: {debugInfo.featuredSnippetsType}</div>
            <div>Length: {debugInfo.featuredSnippetsLength}</div>
            <div>Valid Snippets: {debugInfo.validSnippets}</div>
            <div>Invalid Snippets: {debugInfo.invalidSnippets}</div>
          </div>
          
          {showDebugInfo && (
            <div className="mt-2 pt-2 border-t border-red-500/20">
              <div className="text-xs">First Item Structure: {Array.isArray(debugInfo.firstSnippetStructure) ? debugInfo.firstSnippetStructure.join(', ') : debugInfo.firstSnippetStructure}</div>
              {debugInfo.sampleData.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium">Sample Data:</div>
                  <pre className="text-xs bg-black/20 p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(debugInfo.sampleData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-3 py-4"
    >
      {/* Success indicator */}
      <div className="flex items-center gap-2 text-xs text-green-400 mb-2">
        <Target className="h-3.5 w-3.5" />
        <span>Found {validSnippets.length} valid snippet{validSnippets.length !== 1 ? 's' : ''}</span>
        {debugInfo.invalidSnippets > 0 && (
          <span className="text-amber-400 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {debugInfo.invalidSnippets} skipped
          </span>
        )}
      </div>
      
      {validSnippets.map((snippet, index) => {
        const content = snippet.content;
        const type = snippet.type || 'paragraph';
        const title = snippet.title || '';
        const source = snippet.source || 'Search results';

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
                            
                            {/* Show dictionary-specific metadata */}
                            {type === 'dictionary_results' && snippet.metadata && (
                              <div className="mt-3 pt-3 border-t border-green-500/20">
                                {snippet.metadata.word_type && (
                                  <div className="text-xs text-green-300 mb-1">
                                    <span className="font-medium">Type:</span> {snippet.metadata.word_type}
                                  </div>
                                )}
                                {snippet.metadata.definitions && (
                                  <div className="text-xs text-green-300">
                                    <span className="font-medium">Definitions:</span>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                      {snippet.metadata.definitions.slice(0, 3).map((def, i) => (
                                        <li key={i}>{def}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
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
