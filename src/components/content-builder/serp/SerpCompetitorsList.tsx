
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Link, Plus } from 'lucide-react';

interface SerpCompetitor {
  type: string;
  content: string;
  selected: boolean;
  source?: string;
}

interface SerpCompetitorsListProps {
  competitors: SerpCompetitor[];
  handleToggleSelection: (type: string, content: string) => void;
}

export const SerpCompetitorsList: React.FC<SerpCompetitorsListProps> = ({
  competitors,
  handleToggleSelection
}) => {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-900/10 to-amber-900/5 backdrop-blur-md shadow-xl">
      <CardContent className="pt-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {competitors.map((competitor, index) => (
            <motion.div 
              key={index} 
              variants={item}
              whileHover={{ scale: 1.01 }}
              className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                competitor.selected 
                  ? "border-amber-500 bg-amber-500/10 shadow-inner" 
                  : "border-white/10 hover:border-amber-500/30 hover:bg-amber-900/20"
              }`}
            >
              <div className="flex items-start mb-3">
                <Checkbox 
                  id={`competitor-${index}`} 
                  checked={competitor.selected}
                  onCheckedChange={() => handleToggleSelection(competitor.type, competitor.content)}
                  className={`mt-1 mr-3 ${
                    competitor.selected 
                      ? "border-amber-500 bg-amber-500 text-white" 
                      : "border-white/40 text-transparent"
                  }`}
                />
                <div className="flex-1">
                  <Label 
                    htmlFor={`competitor-${index}`} 
                    className="cursor-pointer flex-1 text-sm select-none mb-2 block"
                  >
                    {competitor.content.length > 100 
                      ? `${competitor.content.substring(0, 100)}...` 
                      : competitor.content
                    }
                  </Label>
                  
                  {competitor.source && (
                    <div className="text-xs text-blue-300 flex items-center gap-1 hover:underline">
                      <Link className="h-3 w-3" />
                      <a 
                        href={competitor.source} 
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {competitor.source.length > 40 
                          ? `${competitor.source.substring(0, 40)}...` 
                          : competitor.source
                        }
                      </a>
                    </div>
                  )}
                </div>
                
                {!competitor.selected && (
                  <span 
                    className="opacity-0 hover:opacity-100 transition-opacity duration-200 text-xs bg-amber-500/10 text-amber-400 rounded-full px-2 py-0.5 flex items-center gap-1 border border-amber-500/20"
                    onClick={() => handleToggleSelection(competitor.type, competitor.content)}
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {competitors.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <Link className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No competitor data available.</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
