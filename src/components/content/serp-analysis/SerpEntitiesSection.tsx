
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';
import { motion } from 'framer-motion';

interface SerpEntitiesSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export const SerpEntitiesSection: React.FC<SerpEntitiesSectionProps> = ({ 
  serpData, 
  expanded, 
  onAddToContent = () => {} 
}) => {
  if (!expanded || !serpData?.entities?.length) return null;

  // Group entities by region/country if they have a country prefix
  const entitiesByRegion = serpData.entities.reduce((acc: Record<string, Array<{
    name: string;
    type?: string;
    importance?: number;
    description?: string;
  }>>, entity) => {
    // Check if entity name starts with a country code pattern (e.g., "us:", "uk:", etc.)
    const match = entity.name.match(/^([a-z]{2}):\s*(.*)/i);
    
    if (match) {
      const [, country, actualName] = match;
      const regionKey = country.toLowerCase();
      
      if (!acc[regionKey]) {
        acc[regionKey] = [];
      }
      
      // Add the entity with the prefix removed
      acc[regionKey].push({
        ...entity,
        name: actualName.trim()
      });
    } else {
      // If no country prefix, put in "global" category
      if (!acc.global) {
        acc.global = [];
      }
      acc.global.push(entity);
    }
    
    return acc;
  }, {});
  
  const hasMultipleRegions = Object.keys(entitiesByRegion).length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* If we have grouped entities by region, display them in separate sections */}
      {hasMultipleRegions ? (
        Object.entries(entitiesByRegion).map(([region, entities]) => (
          <div key={region} className="space-y-2">
            <h4 className="text-xs font-medium capitalize mb-1">
              {region === 'global' ? 'Global Entities' : `${region.toUpperCase()} Entities`}
            </h4>
            
            <div className="flex flex-wrap gap-2">
              {entities.map((entity, index) => (
                <Badge 
                  key={`${region}-${index}`}
                  variant="outline" 
                  className="py-1.5 pl-3 pr-2 bg-indigo-950/30 border-indigo-500/20 hover:bg-indigo-900/30 cursor-pointer group flex items-center gap-1"
                  onClick={() => onAddToContent(entity.name, 'entity')}
                >
                  {entity.name}
                  <PlusCircle className="h-3 w-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Badge>
              ))}
            </div>
          </div>
        ))
      ) : (
        // If no country grouping, show entities as before
        <div className="flex flex-wrap gap-2">
          {serpData.entities.map((entity, index) => (
            <Badge 
              key={index}
              variant="outline" 
              className="py-1.5 pl-3 pr-2 bg-indigo-950/30 border-indigo-500/20 hover:bg-indigo-900/30 cursor-pointer group flex items-center gap-1"
              onClick={() => onAddToContent(entity.name, 'entity')}
            >
              {entity.name}
              <PlusCircle className="h-3 w-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Badge>
          ))}
        </div>
      )}
    </motion.div>
  );
};
