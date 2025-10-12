import React from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface DataRepresentationPanelProps {
  dataRepresentation: any;
  chartTitle: string;
}

export const DataRepresentationPanel: React.FC<DataRepresentationPanelProps> = ({ 
  dataRepresentation, 
  chartTitle 
}) => {
  if (!dataRepresentation) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg"
    >
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="space-y-2 text-sm">
          <h4 className="font-semibold text-primary">Understanding "{chartTitle}"</h4>
          
          {dataRepresentation.interpretation && (
            <p className="text-muted-foreground">
              {dataRepresentation.interpretation}
            </p>
          )}
          
          <div className="grid grid-cols-2 gap-3 mt-2">
            {dataRepresentation.xAxis && (
              <div>
                <span className="font-medium text-foreground">X-Axis: </span>
                <span className="text-muted-foreground">{dataRepresentation.xAxis}</span>
              </div>
            )}
            {dataRepresentation.yAxis && (
              <div>
                <span className="font-medium text-foreground">Y-Axis: </span>
                <span className="text-muted-foreground">{dataRepresentation.yAxis}</span>
              </div>
            )}
          </div>
          
          {dataRepresentation.keyInsights && dataRepresentation.keyInsights.length > 0 && (
            <div className="mt-2 pt-2 border-t border-primary/10">
              <span className="font-medium text-foreground">Key Insights:</span>
              <ul className="mt-1 space-y-1">
                {dataRepresentation.keyInsights.map((insight: string, idx: number) => (
                  <li key={idx} className="text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
