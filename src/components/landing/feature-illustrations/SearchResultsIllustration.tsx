import React from 'react';
import { motion } from 'framer-motion';
import { Search, Lightbulb, TrendingUp, Target, HelpCircle } from 'lucide-react';

export const SearchResultsIllustration = () => {
  const searchResults = [
    { rank: 1, strength: 95, gradient: 'from-neon-blue to-neon-pink', delay: 0.4 },
    { rank: 2, strength: 78, gradient: 'from-neon-pink to-primary', delay: 0.6 },
    { rank: 3, strength: 62, gradient: 'from-primary to-neon-orange', delay: 0.8 }
  ];

  const keywords = [
    { text: 'SEO', x: 12, y: 18, delay: 0 },
    { text: 'SERP', x: 82, y: 15, delay: 0.7 },
    { text: 'Rankings', x: 50, y: 88, delay: 1.4 }
  ];

  const questionMarks = [
    { x: 20, y: 28, delay: 0 },
    { x: 75, y: 35, delay: 0.8 }
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      <div className="relative w-full max-w-md">
        
        {/* Large Search Icon */}
        <motion.div
          className="absolute left-1/2 top-0 -translate-x-1/2 z-20"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="w-28 h-28 rounded-full bg-gradient-to-r from-neon-pink to-neon-orange flex items-center justify-center shadow-2xl"
            animate={{ 
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            <Search className="h-14 w-14 text-white" />
          </motion.div>

          {/* Enhanced glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--neon-pink) / 0.5) 0%, transparent 70%)',
            }}
            animate={{ 
              scale: [1, 1.6, 2],
              opacity: [0.7, 0.4, 0]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity,
              ease: "easeOut" 
            }}
          />
        </motion.div>

        {/* Search Result Cards */}
        <div className="space-y-3 pt-36">
          {searchResults.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: result.delay
              }}
            >
              {/* Outer glow */}
              <div className="relative">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${result.gradient} rounded-xl blur opacity-40`} />
                
                {/* Card */}
                <div className="relative bg-card/80 backdrop-blur-xl border border-primary/20 rounded-xl p-4 shadow-2xl">
                  <div className="flex items-center gap-4">
                    {/* Numbered Badge */}
                    <motion.div
                      className={`w-12 h-12 rounded-full bg-gradient-to-r ${result.gradient} flex items-center justify-center font-bold text-white text-lg shrink-0 shadow-lg`}
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        delay: result.delay + 0.5
                      }}
                    >
                      {result.rank}
                    </motion.div>

                    {/* Content Lines */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-2 bg-muted/60 rounded w-full" />
                      <div className="h-2 bg-muted/40 rounded w-2/3" />
                      
                      {/* Rank Strength Progress Bar */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">Rank strength</span>
                          <span className="text-[10px] font-semibold">{result.strength}%</span>
                        </div>
                        <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full bg-gradient-to-r ${result.gradient}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${result.strength}%` }}
                            transition={{ 
                              duration: 1.5, 
                              delay: result.delay + 0.3,
                              ease: "easeOut"
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Trending Icon */}
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: result.delay }}
                    >
                      <TrendingUp className="h-5 w-5 text-primary shrink-0" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Content Gap Opportunity Card */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-orange to-neon-pink rounded-xl blur opacity-40" />
            
            <div className="relative bg-gradient-to-r from-neon-orange/10 to-neon-pink/10 backdrop-blur-xl border border-neon-orange/30 rounded-xl p-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-orange to-neon-pink flex items-center justify-center shrink-0">
                  <Target className="h-5 w-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">Content Gap Found</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    3 ranking opportunities detected
                  </p>
                  
                  {/* Preview Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {['PAA', 'Keywords', 'Gaps'].map((tag, index) => (
                      <motion.span
                        key={index}
                        className="px-2 py-0.5 rounded-full bg-neon-orange/20 border border-neon-orange/30 text-[10px] font-medium"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.4 + index * 0.1 }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>

                <motion.div
                  className="text-neon-orange font-bold text-xl shrink-0"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  +3
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Keywords */}
      {keywords.map((keyword, index) => (
        <motion.div
          key={index}
          className="absolute text-[10px] font-mono text-primary/30 pointer-events-none"
          style={{ left: `${keyword.x}%`, top: `${keyword.y}%` }}
          animate={{ 
            x: [0, 20, 0],
            opacity: [0.2, 0.5, 0.2]
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

      {/* Question Marks → Lightbulbs */}
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
            <HelpCircle className="h-6 w-6 text-muted-foreground/40" />
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
