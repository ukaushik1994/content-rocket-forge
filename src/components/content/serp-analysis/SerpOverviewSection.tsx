
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, FileText, Search, TrendingUp, List, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SerpAnalysisResult } from '@/services/serpApiService';
import { SerpInteractiveCard } from './SerpInteractiveCard';
import { SerpActionButton } from './SerpActionButton';

interface SerpOverviewSectionProps {
  serpData: SerpAnalysisResult;
  mainKeyword: string;
  expanded: boolean;
  onAddToContent: (content: string, type: string) => void;
}

export function SerpOverviewSection({
  serpData,
  mainKeyword,
  expanded,
  onAddToContent
}: SerpOverviewSectionProps) {
  const [activeTab, setActiveTab] = useState<'strategy' | 'structure' | 'gaps'>('strategy');
  
  if (!expanded) return null;
  
  const tabVariants = {
    active: { 
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      boxShadow: '0 0 10px rgba(155, 135, 245, 0.2)',
      scale: 1
    },
    inactive: { 
      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
      boxShadow: '0 0 0px rgba(0, 0, 0, 0)',
      scale: 0.98
    }
  };
  
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0, y: -20 }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const addRecommendation = (recommendation: string) => {
    onAddToContent(`## Recommendation\n${recommendation}\n\n`, 'recommendation');
    toast.success('Added recommendation to your content');
  };

  const addStructure = () => {
    const structureText = `
## Recommended Content Structure
- H1: Use numbers (e.g., "10 Best ${mainKeyword} in 2025")
- Include definitions in the intro
- Use H2 for main categories
- Include a comparison table
- End with FAQ section
    `;
    onAddToContent(structureText, 'contentStructure');
    toast.success('Added content structure recommendations');
  };

  const addContentGap = (query: string) => {
    const gapText = `## ${query.charAt(0).toUpperCase() + query.slice(1)}\nThis section addresses the common questions about ${query}...\n\n`;
    onAddToContent(gapText, 'contentGap');
    toast.success(`Added section for "${query}"`);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Interactive Tabs */}
      <div className="flex space-x-2 p-1 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
        <motion.button
          variants={tabVariants}
          animate={activeTab === 'strategy' ? 'active' : 'inactive'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('strategy')}
          className="flex-1 py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200"
        >
          <TrendingUp className="h-4 w-4 text-purple-400" />
          Strategy
        </motion.button>
        
        <motion.button
          variants={tabVariants}
          animate={activeTab === 'structure' ? 'active' : 'inactive'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('structure')}
          className="flex-1 py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200"
        >
          <List className="h-4 w-4 text-green-400" />
          Structure
        </motion.button>
        
        <motion.button
          variants={tabVariants}
          animate={activeTab === 'gaps' ? 'active' : 'inactive'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('gaps')}
          className="flex-1 py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200"
        >
          <HelpCircle className="h-4 w-4 text-amber-400" />
          Content Gaps
        </motion.button>
      </div>
      
      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'strategy' && (
          <motion.div
            key="strategy"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 gap-4"
          >
            {serpData.recommendations?.map((recommendation, index) => (
              <motion.div key={index} variants={itemVariants}>
                <SerpInteractiveCard
                  title={`Strategy ${index + 1}`}
                  content={recommendation}
                  type="recommendation"
                  variant="purple"
                  onAdd={() => addRecommendation(recommendation)}
                />
              </motion.div>
            ))}
            
            <motion.div variants={itemVariants} className="mt-2">
              <SerpActionButton
                variant="outline"
                onClick={() => {
                  const recommendationsText = serpData.recommendations?.join('\n- ') || '';
                  onAddToContent(`## Content Strategy\n- ${recommendationsText}\n\n`, 'contentStrategy');
                  toast.success('Added all content strategy recommendations');
                }}
                className="bg-gradient-to-r from-purple-600/20 to-purple-900/10 border-purple-500/20 hover:border-purple-500/40"
              >
                Add All Recommendations
              </SerpActionButton>
            </motion.div>
          </motion.div>
        )}
        
        {activeTab === 'structure' && (
          <motion.div
            key="structure"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            <motion.div
              variants={itemVariants}
              className="p-5 rounded-xl backdrop-blur-md bg-gradient-to-br from-green-600/20 to-green-900/10 border border-white/10"
            >
              <h4 className="text-green-300 font-medium flex items-center gap-2 mb-4">
                <List className="h-4 w-4" />
                Recommended Structure
              </h4>
              
              <ul className="space-y-3">
                <motion.li 
                  className="flex items-start gap-2"
                  variants={itemVariants}
                >
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">H1: Use numbers (e.g., "10 Best {mainKeyword} in 2025")</span>
                </motion.li>
                <motion.li 
                  className="flex items-start gap-2"
                  variants={itemVariants}
                >
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Include definitions in the intro</span>
                </motion.li>
                <motion.li 
                  className="flex items-start gap-2"
                  variants={itemVariants}
                >
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Use H2 for main categories</span>
                </motion.li>
                <motion.li 
                  className="flex items-start gap-2"
                  variants={itemVariants}
                >
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Include a comparison table</span>
                </motion.li>
                <motion.li 
                  className="flex items-start gap-2"
                  variants={itemVariants}
                >
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">End with FAQ section</span>
                </motion.li>
              </ul>
              
              <motion.div variants={itemVariants} className="mt-6">
                <SerpActionButton
                  onClick={addStructure}
                  className="bg-gradient-to-r from-green-600/20 to-green-900/10 border-green-500/20 hover:border-green-500/40"
                  variant="outline"
                >
                  Add Structure Template
                </SerpActionButton>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
        
        {activeTab === 'gaps' && (
          <motion.div
            key="gaps"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground mb-3">
              These topics are missing from top-ranking content but have search demand:
            </p>
            
            <div className="grid grid-cols-1 gap-4">
              {serpData.relatedSearches?.slice(0, 4).map((item, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                  <SerpInteractiveCard
                    title={item.query}
                    content={`This topic has search demand but isn't covered well in top-ranking content.${item.volume ? ` Monthly volume: ${item.volume}` : ''}`}
                    type="contentGap"
                    variant="amber"
                    badge={item.volume ? `${item.volume}` : undefined}
                    onAdd={() => addContentGap(item.query)}
                  />
                </motion.div>
              ))}
              
              <motion.div variants={itemVariants} className="mt-2">
                <SerpActionButton
                  variant="outline"
                  onClick={() => {
                    const gapAnalysisText = serpData.relatedSearches?.slice(0, 3).map(item => 
                      `### ${item.query}\nThis topic is missing from top-ranking content but has search demand.\n\n`
                    ).join('') || '';
                    
                    onAddToContent(`## Content Gap Analysis\n\n${gapAnalysisText}`, 'contentGap');
                    toast.success('Added complete content gap analysis');
                  }}
                  className="bg-gradient-to-r from-amber-600/20 to-amber-900/10 border-amber-500/20 hover:border-amber-500/40"
                >
                  Add All Content Gaps
                </SerpActionButton>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
