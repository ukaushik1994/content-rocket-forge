
import React from 'react';
import { motion } from 'framer-motion';
import { SerpAnalysisResult } from '@/types/serp';

interface SerpMetricsSectionProps {
  serpData: SerpAnalysisResult;
  mainKeyword: string;
  expanded: boolean;
}

export function SerpMetricsSection({ serpData, mainKeyword, expanded }: SerpMetricsSectionProps) {
  if (!expanded) return null;

  const metrics = [
    {
      name: "Search Volume",
      value: serpData.searchVolume ? serpData.searchVolume.toLocaleString() : "N/A",
      description: "Monthly searches for this keyword"
    },
    {
      name: "Keyword Difficulty",
      value: serpData.keywordDifficulty ? serpData.keywordDifficulty.toString() : "N/A",
      description: "How hard it is to rank for this keyword (0-100)"
    },
    {
      name: "Competition",
      value: serpData.competitionScore ? `${Math.round(serpData.competitionScore * 100)}%` : "N/A",
      description: "Level of competition from other websites"
    }
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"
    >
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.name}
          variants={item}
          className="bg-white/5 rounded-lg border border-white/10 p-4"
        >
          <h4 className="text-xs text-muted-foreground">{metric.name}</h4>
          <div className="text-lg font-semibold mt-1">{metric.value}</div>
          <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
          
          {/* Add progress bar for difficulty and competition */}
          {(metric.name === "Keyword Difficulty" || metric.name === "Competition") && (
            <div className="mt-2 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                style={{ 
                  width: metric.name === "Keyword Difficulty" 
                    ? `${serpData.keywordDifficulty || 0}%` 
                    : `${(serpData.competitionScore || 0) * 100}%` 
                }}
              />
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
