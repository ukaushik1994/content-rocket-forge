import React from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, HelpCircle, Target, Lightbulb, Zap } from 'lucide-react';

export const ResearchIllustration = () => {
  const serpResults = [
    { rank: 1, domain: 'competitor-a.com', score: 92 },
    { rank: 2, domain: 'example-blog.io', score: 87 },
    { rank: 3, domain: 'your-site.com', score: 84, isYou: true },
    { rank: 4, domain: 'industry-news.com', score: 79 },
  ];

  const keywords = [
    { term: 'content marketing', volume: '12K', trend: 'up' },
    { term: 'SEO strategy', volume: '8.5K', trend: 'up' },
    { term: 'blog optimization', volume: '5.2K', trend: 'stable' },
  ];

  return (
    <div className="relative w-full h-full max-h-full flex items-center justify-center overflow-hidden">
      {/* Large search icon backdrop */}
      <motion.div
        className="absolute"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.08 }}
        transition={{ duration: 1 }}
      >
        <Search className="w-36 h-36 text-neon-purple" />
      </motion.div>

      <div className="relative grid grid-cols-2 gap-3 w-full max-w-md px-2 z-10 scale-[0.9]">
        {/* SERP Results Panel */}
        <motion.div
          className="rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-3 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent rounded-xl"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <motion.div
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center"
              animate={{ boxShadow: ['0 0 15px rgba(155,135,245,0.4)', '0 0 25px rgba(155,135,245,0.6)', '0 0 15px rgba(155,135,245,0.4)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Search className="w-4 h-4 text-white" />
            </motion.div>
            <span className="text-xs font-semibold text-white">SERP Analysis</span>
          </div>

          <div className="space-y-1.5 relative z-10">
            {serpResults.map((result, index) => (
              <motion.div
                key={result.rank}
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  result.isYou 
                    ? 'bg-gradient-to-r from-neon-purple/20 to-neon-blue/10 border border-neon-purple/40' 
                    : 'bg-slate-700/40 border border-transparent'
                }`}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <span className={`text-xs font-bold ${result.isYou ? 'text-neon-purple' : 'text-white/50'}`}>
                  #{result.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] truncate ${result.isYou ? 'text-white font-medium' : 'text-white/70'}`}>
                    {result.domain}
                  </div>
                </div>
                <div className="text-[10px] font-semibold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                  {result.score}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Keywords Panel */}
        <motion.div
          className="rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-3 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          />
          
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <motion.div
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center"
              animate={{ boxShadow: ['0 0 15px rgba(30,174,219,0.4)', '0 0 25px rgba(30,174,219,0.6)', '0 0 15px rgba(30,174,219,0.4)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="w-4 h-4 text-white" />
            </motion.div>
            <span className="text-xs font-semibold text-white">Keywords</span>
          </div>

          <div className="space-y-1.5 relative z-10">
            {keywords.map((kw, index) => (
              <motion.div
                key={kw.term}
                className="p-2 rounded-lg bg-slate-700/40"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/90 font-medium">{kw.term}</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-2.5 h-2.5 text-green-400" />
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-semibold">
                      {kw.volume}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* PAA Question */}
          <motion.div
            className="mt-2 p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[9px] text-amber-300/80 flex-1">
                "How to optimize content?"
              </span>
              <Lightbulb className="w-3 h-3 text-amber-400" />
            </div>
          </motion.div>
        </motion.div>

        {/* Content Gap Detector - Full Width */}
        <motion.div
          className="col-span-2 rounded-xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 border border-orange-500/30 p-3"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500/30 to-red-500/20 flex items-center justify-center"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Target className="w-4 h-4 text-orange-400" />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white">Content Gap Found</span>
                <Zap className="w-3 h-3 text-amber-400" />
              </div>
              <div className="text-[10px] text-white/60">
                3 high-value topics your competitors rank for
              </div>
            </div>
            <motion.div
              className="text-lg font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              +3
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
