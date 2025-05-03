import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, PlusCircle, Award, ExternalLink, Star, Filter, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SerpAnalysisResult } from '@/services/serpApiService';
import { SerpActionButton } from './SerpActionButton';
import { SerpFeedbackButton } from './SerpFeedbackButton';

interface SerpCompetitorsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent: (content: string, type: string) => void;
}

export function SerpCompetitorsSection({
  serpData,
  expanded,
  onAddToContent
}: SerpCompetitorsSectionProps) {
  const [selectedCompetitors, setSelectedCompetitors] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  if (!expanded) return null;

  const toggleCompetitorSelection = (position: number) => {
    if (selectedCompetitors.includes(position)) {
      setSelectedCompetitors(selectedCompetitors.filter(p => p !== position));
    } else {
      setSelectedCompetitors([...selectedCompetitors, position]);
      toast.success(`Added competitor #${position} to selection`);
    }
  };

  const addSelectedCompetitors = () => {
    if (selectedCompetitors.length === 0) {
      toast.error("No competitors selected");
      return;
    }
    
    const selectedCompetitorsData = serpData.topResults?.filter(
      result => selectedCompetitors.includes(result.position)
    ) || [];
    
    let competitorInsightsContent = `## Competitor Research Analysis\n\n`;
    selectedCompetitorsData.forEach(result => {
      competitorInsightsContent += `### ${result.title}\n${result.snippet}\n[Source](${result.link})\n\n`;
    });
    
    onAddToContent(competitorInsightsContent, 'selectedCompetitors');
    toast.success(`Added ${selectedCompetitors.length} competitor insights`);
  };

  if (!serpData.topResults || serpData.topResults.length === 0) {
    return (
      <div className="py-8 text-center bg-white/5 rounded-lg border border-white/10">
        <Award className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground">No competitor data available</p>
      </div>
    );
  }

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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-5"
    >
      {/* Controls & Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-blue-400" />
          <span className="text-sm text-blue-300 font-medium">Top {serpData.topResults.length} competitors</span>
        </div>
        
        <div className="flex rounded-lg bg-white/5 p-1">
          <Button
            variant="ghost"
            size="sm"
            className={`text-xs px-2 py-1 h-7 ${viewMode === 'grid' ? 'bg-white/10' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`text-xs px-2 py-1 h-7 ${viewMode === 'list' ? 'bg-white/10' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>
      
      {/* Selected counter */}
      {selectedCompetitors.length > 0 && (
        <div className="bg-gradient-to-r from-blue-800/30 to-indigo-800/30 p-2 rounded-lg flex justify-between items-center">
          <span className="text-sm">
            <span className="text-blue-300 font-medium">{selectedCompetitors.length}</span> competitors selected
          </span>
          <Button
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs"
            onClick={() => setSelectedCompetitors([])}
          >
            Clear
          </Button>
        </div>
      )}
      
      {/* Competitors Grid/List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}
        >
          {serpData.topResults.map((result, index) => (
            <motion.div 
              key={result.position}
              variants={itemVariants}
              className={`
                cursor-pointer transition-all duration-300
                ${selectedCompetitors.includes(result.position) 
                  ? 'border-blue-500/40 bg-blue-900/20' 
                  : 'border-white/10 hover:border-white/20 bg-gradient-to-br from-blue-900/10 via-slate-900/10 to-blue-900/10'}
                border rounded-lg overflow-hidden relative group
              `}
              onClick={() => toggleCompetitorSelection(result.position)}
            >
              {/* Position badge */}
              <div className="absolute top-3 left-3 z-10">
                <Badge 
                  variant="outline" 
                  className={`
                    font-medium ${selectedCompetitors.includes(result.position)
                      ? 'bg-blue-500 border-blue-400 text-white' 
                      : 'bg-white/10 border-0 backdrop-blur-md'}
                  `}
                >
                  #{result.position}
                </Badge>
              </div>
              
              {/* Selection indicator */}
              <div className={`
                absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center
                transition-all duration-300
                ${selectedCompetitors.includes(result.position)
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/5 opacity-0 group-hover:opacity-100'}
              `}>
                <PlusCircle className="h-3.5 w-3.5" />
              </div>
              
              {/* Main content */}
              <div className="p-5">
                <h4 className="font-medium text-white mb-2 mt-3 line-clamp-2">{result.title}</h4>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{result.snippet}</p>
                
                <div className="flex items-center justify-between">
                  <a 
                    href={result.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary flex items-center gap-1 hover:underline text-xs group-hover:text-blue-300 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Visit source
                  </a>
                  
                  <SerpFeedbackButton
                    itemType="competitor"
                    itemContent={result.title}
                  />
                </div>
              </div>
              
              {/* Background glowing effect for selected items */}
              {selectedCompetitors.includes(result.position) && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0"></div>
                  <div className="absolute inset-0 bg-grid-white/5 opacity-20"></div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
      
      <div className="flex flex-col gap-2 pt-2">
        <SerpActionButton
          onClick={addSelectedCompetitors}
          className={`${selectedCompetitors.length === 0 ? 'opacity-50' : ''}`}
          variant="outline"
          icon={<Star className="h-4 w-4 mr-2" />}
          disabled={selectedCompetitors.length === 0}
          actionType="add"
        >
          Add {selectedCompetitors.length} Selected Competitors
        </SerpActionButton>
        
        <SerpActionButton
          variant="outline"
          onClick={() => {
            let competitorInsightsContent = `## Competitor Research Analysis\n\n`;
            serpData.topResults?.slice(0, 3).forEach(result => {
              competitorInsightsContent += `### ${result.title}\n${result.snippet}\n[Source](${result.link})\n\n`;
            });
            onAddToContent(competitorInsightsContent, 'competitorAnalysis');
            toast.success('Added competitor analysis section');
          }}
          className="mt-2"
          icon={<Award className="h-4 w-4 mr-2" />}
          actionType="add"
        >
          Add Complete Competitor Analysis
        </SerpActionButton>
      </div>
    </motion.div>
  );
}
