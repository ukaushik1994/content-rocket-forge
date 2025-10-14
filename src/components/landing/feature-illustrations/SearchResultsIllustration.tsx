import React from 'react';
import { motion } from 'framer-motion';
import { Search, Lightbulb, TrendingUp, Target, HelpCircle } from 'lucide-react';

export const SearchResultsIllustration = () => {
  const searchResults = [
    { rank: 1, color: 'from-primary to-neon-blue', delay: 0 },
    { rank: 2, color: 'from-neon-blue to-neon-pink', delay: 0.3 },
    { rank: 3, color: 'from-neon-pink to-neon-orange', delay: 0.6 }
  ];

  const keywords = [
    { text: 'SEO', x: 10, y: 20, delay: 0 },
    { text: 'Content', x: 80, y: 15, delay: 0.5 },
    { text: 'Ranking', x: 15, y: 80, delay: 1 },
    { text: 'SERP', x: 85, y: 75, delay: 1.5 },
    { text: 'Keywords', x: 50, y: 90, delay: 2 }
  ];

  const questionMarks = [
    { x: 25, y: 30, delay: 0 },
    { x: 70, y: 35, delay: 0.7 },
    { x: 40, y: 65, delay: 1.4 }
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      <div className="relative w-full max-w-md">
        
        {/* Large Search Icon with Magnifying Glass */}
        <motion.div
          className="absolute left-1/2 top-0 -translate-x-1/2 z-20"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="bg-gradient-to-r from-neon-pink to-neon-orange p-6 rounded-full shadow-2xl"
          >
            <Search className="h-16 w-16 text-white" />
          </motion.div>

          {/* Search beam */}
          <motion.div
            className="absolute top-full left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-neon-pink to-transparent"
            initial={{ height: 0 }}
            animate={{ height: 200 }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeOut" 
            }}
          />
        </motion.div>

        {/* Search Results Cards */}
        <div className="space-y-3 pt-32">
          {searchResults.map((result, index) => (
            <motion.div
              key={index}
              className={`bg-gradient-to-r ${result.color} p-0.5 rounded-lg shadow-xl`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: result.delay,
                repeat: Infinity,
                repeatDelay: 4
              }}
            >
              <div className="bg-card rounded-lg p-4 flex items-center gap-4">
                <motion.div
                  className={`w-10 h-10 rounded-full bg-gradient-to-r ${result.color} flex items-center justify-center font-bold text-white text-lg`}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    delay: result.delay + 1
                  }}
                >
                  {result.rank}
                </motion.div>
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-2 bg-muted/60 rounded w-full" />
                  <div className="h-2 bg-muted/40 rounded w-2/3" />
                </div>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Gap Opportunity Indicator */}
        <motion.div
          className="mt-6 bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-xs font-semibold">Content Gap Found</p>
              <p className="text-xs text-muted-foreground">3 ranking opportunities detected</p>
            </div>
            <motion.div
              className="text-primary text-lg font-bold"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              +3
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Floating Keywords */}
      {keywords.map((keyword, index) => (
        <motion.div
          key={index}
          className="absolute text-xs font-mono text-primary/40 pointer-events-none"
          style={{ left: `${keyword.x}%`, top: `${keyword.y}%` }}
          animate={{ 
            x: [0, 30, 0],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            delay: keyword.delay,
            ease: "easeInOut" 
          }}
        >
          #{keyword.text}
        </motion.div>
      ))}

      {/* Question Marks transforming to Lightbulbs */}
      {questionMarks.map((pos, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        >
          <motion.div
            animate={{ 
              scale: [1, 0],
              rotate: [0, 180]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: pos.delay,
              repeatDelay: 2
            }}
          >
            <HelpCircle className="h-6 w-6 text-muted-foreground" />
          </motion.div>
          <motion.div
            className="absolute inset-0"
            animate={{ 
              scale: [0, 1],
              rotate: [-180, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: pos.delay + 1,
              repeatDelay: 2
            }}
          >
            <Lightbulb className="h-6 w-6 text-neon-orange" />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};
