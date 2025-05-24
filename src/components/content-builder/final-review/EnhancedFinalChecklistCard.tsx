
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEnhancedChecklistItems, ChecklistSection } from './hooks/useEnhancedChecklistItems';

interface EnhancedFinalChecklistCardProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const EnhancedFinalChecklistCard = ({ onRefresh, isRefreshing = false }: EnhancedFinalChecklistCardProps) => {
  const { checklistData, isAnalyzing, refreshChecklist } = useEnhancedChecklistItems();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['technical']));
  
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getSectionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-500 bg-green-500/10 border-green-500/30';
    if (percentage >= 60) return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    return 'text-red-500 bg-red-500/10 border-red-500/30';
  };

  const getOverallColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const handleRefresh = () => {
    refreshChecklist();
    if (onRefresh) onRefresh();
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Card className="h-full shadow-xl bg-gradient-to-br from-background to-purple-950/5 border border-purple-500/20">
      <CardHeader className="pb-3 border-b border-purple-500/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            Enhanced Content Checklist
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isAnalyzing}
            className="h-8 px-2"
          >
            <Loader2 className={`h-4 w-4 ${isRefreshing || isAnalyzing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Overall Progress */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {checklistData.totalPassed} of {checklistData.totalChecks} checks passed
            </span>
            <span className="text-sm font-medium text-purple-500">
              {checklistData.overallScore}%
            </span>
          </div>
          
          <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
            <motion.div 
              className={`bg-gradient-to-r ${getOverallColor(checklistData.overallScore)} h-full rounded-full`}
              style={{ width: '0%' }}
              animate={{ width: `${checklistData.overallScore}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 max-h-[400px] overflow-y-auto">
        {isAnalyzing && checklistData.sections.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-purple-500" />
              <p className="text-sm text-muted-foreground">Analyzing content...</p>
            </div>
          </div>
        ) : (
          <motion.div 
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {checklistData.sections.map((section) => (
              <motion.div 
                key={section.id}
                variants={itemVariants}
                className="border rounded-lg overflow-hidden"
              >
                {/* Section Header */}
                <div 
                  className={`p-3 cursor-pointer transition-colors hover:bg-muted/30 ${getSectionColor(section.percentage)}`}
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {expandedSections.has(section.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="font-medium text-sm">{section.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">
                        {section.passedCount}/{section.totalCount}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {section.percentage}%
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Section Content */}
                <AnimatePresence>
                  {expandedSections.has(section.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 pt-0 space-y-2 border-t">
                        {section.items.map((item, index) => (
                          <motion.div 
                            key={`${section.id}-${index}`}
                            className={`flex items-start gap-3 p-2 rounded-md transition-all ${
                              item.passed 
                                ? 'bg-green-500/10 border border-green-500/30' 
                                : 'bg-secondary/20'
                            }`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className="mt-0.5">
                              {item.passed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500/70" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className={`text-xs block ${item.passed ? 'font-medium' : 'text-muted-foreground'}`}>
                                {item.title}
                              </span>
                              {item.description && (
                                <span className="text-xs text-muted-foreground block mt-1">
                                  {item.description}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
