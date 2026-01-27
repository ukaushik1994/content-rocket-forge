import React from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, HelpCircle, Target } from 'lucide-react';

export const ResearchIllustration = () => {
  const serpResults = [
    { rank: 1, domain: 'competitor-a.com', score: 92 },
    { rank: 2, domain: 'example-blog.io', score: 87 },
    { rank: 3, domain: 'your-site.com', score: 84, isYou: true },
    { rank: 4, domain: 'industry-news.com', score: 79 },
  ];

  const keywords = [
    { term: 'content marketing', volume: '12K' },
    { term: 'SEO strategy', volume: '8.5K' },
    { term: 'blog optimization', volume: '5.2K' },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="grid grid-cols-2 gap-4 w-full max-w-md px-4">
        {/* SERP Results Panel */}
        <motion.div
          className="rounded-xl bg-slate-800/80 border border-white/10 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-neon-purple" />
            <span className="text-xs font-medium text-white/80">SERP Analysis</span>
          </div>

          <div className="space-y-2">
            {serpResults.map((result, index) => (
              <motion.div
                key={result.rank}
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  result.isYou ? 'bg-neon-purple/20 border border-neon-purple/30' : 'bg-slate-700/40'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.15 }}
              >
                <span className={`text-xs font-bold ${result.isYou ? 'text-neon-purple' : 'text-white/50'}`}>
                  #{result.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-white/70 truncate">{result.domain}</div>
                </div>
                <motion.div
                  className="text-[10px] font-medium text-green-400"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                >
                  {result.score}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Keywords Panel */}
        <motion.div
          className="rounded-xl bg-slate-800/80 border border-white/10 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-neon-blue" />
            <span className="text-xs font-medium text-white/80">Keywords</span>
          </div>

          <div className="space-y-2">
            {keywords.map((kw, index) => (
              <motion.div
                key={kw.term}
                className="p-2 rounded-lg bg-slate-700/40"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.15 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/80">{kw.term}</span>
                  <motion.span
                    className="text-[10px] px-1.5 py-0.5 rounded bg-neon-blue/20 text-neon-blue"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    {kw.volume}
                  </motion.span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* PAA Question */}
          <motion.div
            className="mt-3 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="flex items-start gap-2">
              <HelpCircle className="w-3 h-3 text-orange-400 mt-0.5 flex-shrink-0" />
              <span className="text-[9px] text-orange-300/80">
                "How to optimize content for SEO?"
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Content Gap Detector */}
        <motion.div
          className="col-span-2 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-orange-500/20 p-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Target className="w-4 h-4 text-orange-400" />
            </motion.div>
            <div className="flex-1">
              <div className="text-xs font-medium text-white/80">Content Gap Found</div>
              <div className="text-[10px] text-white/50">
                3 topics your competitors cover that you don't
              </div>
            </div>
            <motion.div
              className="text-xs font-bold text-orange-400"
              animate={{ opacity: [0.6, 1, 0.6] }}
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
