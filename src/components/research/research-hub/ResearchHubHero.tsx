import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Search, HelpCircle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ResearchHubHero = React.memo(() => {
  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative"
      >
        <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-4">
          Research Hub
        </h1>
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
        </div>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed"
      >
        Comprehensive research workspace with keyword intelligence, content gap analysis, and people-first question discovery
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.3 }}
        className="flex items-center justify-center"
      >
        <Button 
          size="lg" 
          className="hover-scale bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg px-8 py-3"
        >
          <Search className="h-4 w-4 mr-2" />
          Start Research
        </Button>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="flex items-center justify-center gap-8 text-sm text-white/60"
      >
        <motion.div 
          className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
        >
          <Target className="h-4 w-4 text-blue-400" />
          <span>Keyword Intelligence</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
        >
          <Search className="h-4 w-4 text-purple-400" />
          <span>Content Gaps</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
        >
          <HelpCircle className="h-4 w-4 text-green-400" />
          <span>People Questions</span>
        </motion.div>
      </motion.div>
    </div>
  );
});