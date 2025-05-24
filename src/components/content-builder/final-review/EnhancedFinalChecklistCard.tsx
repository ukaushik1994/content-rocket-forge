
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChecklistSection } from './hooks/useEnhancedChecklistItems';

interface EnhancedFinalChecklistCardProps {
  sections: ChecklistSection[];
  totalChecks: number;
  passedChecks: number;
  overallCompletionPercentage: number;
  isAnalyzing: boolean;
  onRefresh: () => void;
  onToggleSection: (sectionId: string) => void;
}

export const EnhancedFinalChecklistCard: React.FC<EnhancedFinalChecklistCardProps> = ({
  sections,
  totalChecks,
  passedChecks,
  overallCompletionPercentage,
  isAnalyzing,
  onRefresh,
  onToggleSection
}) => {
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
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'technical':
        return '🔧';
      case 'content-quality':
        return '📝';
      case 'serp-integration':
        return '🔍';
      case 'humanization':
        return '👤';
      default:
        return '✅';
    }
  };

  const getSectionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <Card className="h-full shadow-xl bg-gradient-to-br from-background to-purple-950/5 border border-purple-500/20">
      <CardHeader className="pb-2 border-b border-purple-500/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Content Quality Checklist
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isAnalyzing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{passedChecks} of {totalChecks} checks passed</span>
            <span className={`text-sm font-medium ${getSectionColor(overallCompletionPercentage)}`}>
              {overallCompletionPercentage}%
            </span>
          </div>
          
          <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full"
              style={{ width: '0%' }}
              animate={{ width: `${overallCompletionPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            ></motion.div>
          </div>
        </div>

        {/* Sections */}
        <motion.div 
          className="space-y-2 max-h-[400px] overflow-y-auto pr-1 -mr-1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sections.map((section) => (
            <motion.div 
              key={section.id}
              className="border border-white/10 rounded-lg overflow-hidden"
              variants={itemVariants}
            >
              {/* Section Header */}
              <div 
                className="flex items-center justify-between p-3 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => onToggleSection(section.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getSectionIcon(section.id)}</span>
                  <span className="font-medium text-sm">{section.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {section.items.filter(i => i.passed).length}/{section.items.length}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${getSectionColor(section.completionPercentage)}`}>
                    {section.completionPercentage}%
                  </span>
                  {section.expanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </div>

              {/* Section Items */}
              <AnimatePresence>
                {section.expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-2 space-y-1">
                      {section.items.map((item, index) => (
                        <motion.div 
                          key={`${section.id}-${index}`}
                          className={`flex items-start gap-3 p-2 rounded-md transition-all text-xs ${
                            item.passed 
                              ? 'bg-green-500/10 border border-green-500/30' 
                              : 'bg-secondary/20 hover:bg-secondary/30'
                          }`}
                          variants={itemVariants}
                          whileHover={{ scale: 1.01, x: 2 }}
                        >
                          <div className="mt-0.5">
                            {item.passed ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </motion.div>
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500/70" />
                            )}
                          </div>
                          <span className={`${item.passed ? 'font-medium' : 'text-muted-foreground'}`}>
                            {item.title}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
};
