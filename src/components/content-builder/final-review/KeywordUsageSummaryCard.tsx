
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag, Undo, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface KeywordItem {
  keyword: string;
  count: number;
  density: string;
  recommended?: boolean;
  previousDensity?: string;
  previousCount?: number;
  hasChanged?: boolean;
}

interface KeywordUsageSummaryCardProps {
  keywordUsage: KeywordItem[];
  mainKeyword: string;
  selectedKeywords: string[];
}

export const KeywordUsageSummaryCard: React.FC<KeywordUsageSummaryCardProps> = ({
  keywordUsage,
  mainKeyword,
  selectedKeywords,
}) => {
  const [showAllKeywords, setShowAllKeywords] = useState(false);
  const [showChanges, setShowChanges] = useState(false);
  
  // Filter to show main keyword and selected keywords first
  const sortedKeywords = [...keywordUsage].sort((a, b) => {
    if (a.keyword === mainKeyword) return -1;
    if (b.keyword === mainKeyword) return 1;
    if (selectedKeywords.includes(a.keyword) && !selectedKeywords.includes(b.keyword)) return -1;
    if (!selectedKeywords.includes(a.keyword) && selectedKeywords.includes(b.keyword)) return 1;
    return b.count - a.count;
  });
  
  // Display limit for keywords
  const keywordsToShow = showAllKeywords ? sortedKeywords : sortedKeywords.slice(0, 5);
  
  // Check if we have any keywords that have changes
  const hasChanges = keywordUsage.some(kw => kw.hasChanged);
  
  return (
    <Card className="border-blue-500/20 bg-gradient-to-br from-blue-900/10 to-indigo-900/5 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-4 w-4 text-blue-400" />
              Keyword Usage
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Analyze your keyword distribution
            </p>
          </div>
          
          {hasChanges && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs border border-blue-500/20 hover:bg-blue-500/10"
              onClick={() => setShowChanges(!showChanges)}
            >
              {showChanges ? <Check className="h-3.5 w-3.5 mr-1" /> : <Undo className="h-3.5 w-3.5 mr-1" />}
              {showChanges ? "Hide Changes" : "Show Changes"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground border-b border-border/40 pb-1">
            <div className="col-span-6">Keyword</div>
            <div className="col-span-2 text-center">Count</div>
            <div className="col-span-2 text-center">Density</div>
            <div className="col-span-2 text-center">Status</div>
          </div>
          
          <AnimatePresence>
            {keywordsToShow.map((keyword, idx) => (
              <motion.div
                key={keyword.keyword}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="grid grid-cols-12 gap-2 items-center py-1.5 text-sm border-b border-border/10 last:border-none hover:bg-white/5 rounded-sm"
              >
                <div className="col-span-6 flex items-center gap-2 truncate">
                  {keyword.keyword === mainKeyword && (
                    <Badge variant="outline" className="text-xs font-normal border-blue-500/40 bg-blue-500/10">
                      Main
                    </Badge>
                  )}
                  <span className="truncate">{keyword.keyword}</span>
                </div>
                
                <div className="col-span-2 text-center">
                  {showChanges && keyword.hasChanged ? (
                    <div className="flex flex-col">
                      <span className={cn(
                        "text-xs",
                        keyword.count > (keyword.previousCount || 0) ? "text-green-400" : "text-amber-400"
                      )}>
                        {keyword.count}
                      </span>
                      <span className="text-[10px] text-muted-foreground line-through">
                        {keyword.previousCount}
                      </span>
                    </div>
                  ) : (
                    <span>{keyword.count}</span>
                  )}
                </div>
                
                <div className="col-span-2 text-center">
                  {showChanges && keyword.hasChanged ? (
                    <div className="flex flex-col">
                      <span className={cn(
                        "text-xs",
                        parseFloat(keyword.density) > parseFloat(keyword.previousDensity || "0%") 
                          ? "text-green-400" : "text-amber-400"
                      )}>
                        {keyword.density}
                      </span>
                      <span className="text-[10px] text-muted-foreground line-through">
                        {keyword.previousDensity}
                      </span>
                    </div>
                  ) : (
                    <span>{keyword.density}</span>
                  )}
                </div>
                
                <div className="col-span-2 text-center">
                  {keyword.recommended ? (
                    <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-none">
                      <Check className="h-3 w-3 mr-1" /> Good
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                      <X className="h-3 w-3 mr-1" /> Low
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {sortedKeywords.length > 5 && (
            <div className="text-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllKeywords(!showAllKeywords)}
                className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
              >
                {showAllKeywords ? "Show Less" : `Show ${sortedKeywords.length - 5} More Keywords`}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
