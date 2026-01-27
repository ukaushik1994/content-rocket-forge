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
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Large search icon backdrop */}
      <motion.div
        className="absolute"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 1 }}
      >
        <Search className="w-48 h-48 text-neon-purple" />
      </motion.div>

      <div className="relative grid grid-cols-2 gap-5 w-full max-w-lg px-4 z-10">
        {/* SERP Results Panel */}
        <motion.div
          className="rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-5 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent rounded-2xl"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center"
              animate={{ boxShadow: ['0 0 20px rgba(155,135,245,0.4)', '0 0 35px rgba(155,135,245,0.6)', '0 0 20px rgba(155,135,245,0.4)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Search className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-sm font-semibold text-white">SERP Analysis</span>
          </div>

          <div className="space-y-2.5 relative z-10">
            {serpResults.map((result, index) => (
              <motion.div
                key={result.rank}
                className={`flex items-center gap-3 p-2.5 rounded-xl ${
                  result.isYou 
                    ? 'bg-gradient-to-r from-neon-purple/20 to-neon-blue/10 border border-neon-purple/40' 
                    : 'bg-slate-700/40 border border-transparent'
                }`}
                initial={{ opacity: 0, x: -25 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.12 }}
                whileHover={{ scale: 1.02, borderColor: 'rgba(155,135,245,0.3)' }}
              >
                <motion.span 
                  className={`text-sm font-bold ${result.isYou ? 'text-neon-purple' : 'text-white/50'}`}
                  animate={result.isYou ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  #{result.rank}
                </motion.span>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs truncate ${result.isYou ? 'text-white font-medium' : 'text-white/70'}`}>
                    {result.domain}
                  </div>
                </div>
                <motion.div
                  className="text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full"
                  animate={{ opacity: [0.7, 1, 0.7] }}
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
          className="rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-5 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-2xl"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          />
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center"
              animate={{ boxShadow: ['0 0 20px rgba(30,174,219,0.4)', '0 0 35px rgba(30,174,219,0.6)', '0 0 20px rgba(30,174,219,0.4)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-sm font-semibold text-white">Keywords</span>
          </div>

          <div className="space-y-2.5 relative z-10">
            {keywords.map((kw, index) => (
              <motion.div
                key={kw.term}
                className="p-3 rounded-xl bg-slate-700/40 border border-transparent hover:border-cyan-500/30 transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.12 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/90 font-medium">{kw.term}</span>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <motion.span
                      className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 font-semibold"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    >
                      {kw.volume}
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* PAA Question with lightbulb transform */}
          <motion.div
            className="mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center"
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
              </motion.div>
              <div className="flex-1">
                <span className="text-[10px] text-amber-300/80 leading-tight">
                  "How to optimize content for SEO?"
                </span>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.8, type: 'spring' }}
              >
                <Lightbulb className="w-4 h-4 text-amber-400" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Content Gap Detector - Full Width */}
        <motion.div
          className="col-span-2 rounded-2xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 border border-orange-500/30 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/30 to-red-500/20 flex items-center justify-center"
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: ['0 0 20px rgba(249,115,22,0.3)', '0 0 35px rgba(249,115,22,0.5)', '0 0 20px rgba(249,115,22,0.3)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Target className="w-6 h-6 text-orange-400" />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Content Gap Found</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xs text-white/60 mt-0.5">
                3 high-value topics your competitors rank for
              </div>
            </div>
            <motion.div
              className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent"
              animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
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
