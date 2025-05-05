
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SelectedKeywordsProps {
  keywords: string[];
  onRemoveKeyword: (keyword: string) => void;
}

export const SelectedKeywords: React.FC<SelectedKeywordsProps> = ({
  keywords,
  onRemoveKeyword
}) => {
  if (!keywords.length) return null;
  
  return (
    <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-400" />
          Selected Keywords
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <motion.div
              key={keyword}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Badge 
                className="bg-green-950/40 hover:bg-green-900/60 text-green-200 border-green-500/20 group transition-all duration-200"
              >
                {keyword}
                <button 
                  onClick={() => onRemoveKeyword(keyword)} 
                  className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
