
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SerpSelection } from '@/contexts/content-builder/types';
import { QuestionsGroup, KeywordsGroup, SnippetsGroup } from './SelectedItemsGroup';

interface SelectedItemsCardProps {
  totalSelected: number;
  selectedCounts: {
    question: number;
    keyword: number;
    snippet: number;
    competitor: number;
  };
  getItemsByType: (type: string) => SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
}

export const SelectedItemsCard: React.FC<SelectedItemsCardProps> = ({
  totalSelected,
  selectedCounts,
  getItemsByType,
  handleToggleSelection
}) => {
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
    <motion.div 
      variants={item}
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
              <QuestionsGroup 
                count={selectedCounts.question}
                items={getItemsByType('question')}
                handleToggleSelection={handleToggleSelection}
              />
              
              <KeywordsGroup 
                count={selectedCounts.keyword}
                items={getItemsByType('keyword')}
                handleToggleSelection={handleToggleSelection}
              />
              
              <SnippetsGroup 
                count={selectedCounts.snippet}
                items={getItemsByType('snippet')}
                handleToggleSelection={handleToggleSelection}
              />
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
  );
};
