
import React from 'react';
import { motion } from 'framer-motion';
import { SerpAnalysisResult } from '@/services/serpApiService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';

export interface SerpEntitiesSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpEntitiesSection({ 
  serpData, 
  expanded,
  onAddToContent = () => {}
}: SerpEntitiesSectionProps) {
  if (!expanded) return null;
  
  // Use entities from data or fallback to empty array
  const entities = serpData.entities || [];
  
  if (entities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No entities data available for this keyword.</p>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-indigo-500/20 shadow-lg bg-gradient-to-br from-indigo-900/20 via-black/20 to-black/30 backdrop-blur-md overflow-hidden">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {entities.map((entity, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Badge 
                  variant="outline" 
                  className="border-indigo-500/30 bg-indigo-900/10 hover:bg-indigo-900/20 cursor-pointer group flex items-center justify-between w-full py-2 px-3"
                  onClick={() => onAddToContent(entity.name, 'entity')}
                >
                  <span className="truncate">{entity.name}</span>
                  <Plus className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100" />
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end mt-2">
        <Button 
          variant="outline"
          size="sm"
          className="text-xs border-indigo-500/30 hover:bg-indigo-500/20"
          onClick={() => {
            const allEntities = entities.map(e => e.name).join(', ');
            onAddToContent(allEntities, 'allEntities');
          }}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add all entities
        </Button>
      </div>
    </motion.div>
  );
}
