
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Plus, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SerpAnalysisResult } from '@/types/serp';

interface SerpKnowledgeGraphSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpKnowledgeGraphSection({ 
  serpData, 
  expanded, 
  onAddToContent = () => {} 
}: SerpKnowledgeGraphSectionProps) {
  const [expandedDetails, setExpandedDetails] = useState(false);
  
  if (!expanded || !serpData?.knowledgeGraph) return null;
  
  const kg = serpData.knowledgeGraph;
  
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

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-3 py-4"
    >
      <Card className="bg-blue-900/10 border-blue-500/20 hover:border-blue-500/40 transition-all">
        <CardContent className="p-0">
          {/* Knowledge Graph Header */}
          <div className="p-4 border-b border-blue-500/10">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3 flex-1">
                <Brain className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-white/90 mb-1">{kg.title}</h3>
                  {kg.type && (
                    <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-300">
                      {kg.type}
                    </Badge>
                  )}
                  {kg.description && (
                    <p className="text-sm text-white/70 mt-2 leading-relaxed">{kg.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                  onClick={() => onAddToContent(kg.title, 'knowledgeEntity')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                  onClick={() => setExpandedDetails(!expandedDetails)}
                >
                  {expandedDetails ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Expanded Details */}
          <AnimatePresence>
            {expandedDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-4">
                  {/* Attributes */}
                  {Object.keys(kg.attributes).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white/80 mb-2">Key Attributes</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(kg.attributes).slice(0, 6).map(([key, value]) => (
                          <div key={key} className="bg-blue-500/10 rounded p-2">
                            <span className="text-xs text-blue-300 font-medium">{key}:</span>
                            <span className="text-xs text-white/70 ml-1">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Related Entities */}
                  {kg.relatedEntities && kg.relatedEntities.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white/80 mb-2">Related Entities</h4>
                      <div className="flex flex-wrap gap-2">
                        {kg.relatedEntities.slice(0, 8).map((entity, index) => (
                          <motion.div key={index} variants={item}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-3 text-xs border-blue-500/30 text-blue-300 hover:bg-blue-900/20 hover:border-blue-500/50"
                              onClick={() => onAddToContent(entity.name, 'relatedEntity')}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              {entity.name}
                              {entity.link && <ExternalLink className="h-3 w-3 ml-1" />}
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
