import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, TrendingUp, Calendar, FileText, Sparkles, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const mockProposals = [
  {
    priority: 'Quick Win',
    priorityColor: 'success',
    title: 'Best AI Tools for Small Business',
    impressions: 8500,
    primaryKeyword: 'ai tools small business',
    secondaryCount: 12,
    contentType: 'Listicle'
  },
  {
    priority: 'High Return',
    priorityColor: 'primary',
    title: 'How to Use AI for Content Marketing',
    impressions: 15200,
    primaryKeyword: 'ai content marketing',
    secondaryCount: 18,
    contentType: 'How-To Guide'
  }
];

export const AIProposalDemo = () => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const phases = [0, 1, 2, 3, 4];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % phases.length;
      setAnimationPhase(phases[currentIndex]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid lg:grid-cols-5 gap-8 items-start">
      {/* Left Side - Features */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="lg:col-span-2 space-y-6"
      >
        <div>
          <h3 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-neon-pink bg-clip-text text-transparent">
            Goal → Strategy → Content
          </h3>
          <p className="text-muted-foreground text-lg">
            Automated content proposals with keyword research, SERP data, and ready-to-use outlines.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Goal-Based Generation</h4>
              <p className="text-sm text-muted-foreground">
                Input your traffic goal and get tailored content strategy
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-success/10 text-success">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Priority Ranking</h4>
              <p className="text-sm text-muted-foreground">
                Quick Wins, High Returns, and Evergreen opportunities
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-neon-blue/10 text-neon-blue">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">SERP-Backed Research</h4>
              <p className="text-sm text-muted-foreground">
                Real competitive data and intelligent keyword filtering
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-neon-pink/10 text-neon-pink">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">One-Click Integration</h4>
              <p className="text-sm text-muted-foreground">
                Pre-fills Content Builder with outlines and metadata
              </p>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full sm:w-auto"
          onClick={() => navigate('/content-strategy')}
        >
          Generate Proposals
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>

      {/* Right Side - Animated Demo */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="lg:col-span-3"
      >
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="p-6 space-y-6 min-h-[600px]">
            {/* Goal Input - Enhanced */}
            <AnimatePresence>
              {animationPhase >= 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-gradient-to-br from-primary/10 via-neon-blue/5 to-transparent backdrop-blur-xl border border-primary/20 rounded-2xl p-6 shadow-lg"
                >
                  <label className="text-sm font-medium flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    Monthly Traffic Goal
                  </label>
                  <div className="relative mb-4">
                    <input
                      type="text"
                      value="50,000 visits"
                      readOnly
                      className="w-full px-5 py-4 bg-card/80 border-2 border-primary/30 rounded-xl text-xl font-bold text-center shadow-inner backdrop-blur-sm focus:border-primary transition-colors"
                    />
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-neon-blue/20 to-neon-pink/20 opacity-0 pointer-events-none"
                      animate={{ opacity: [0, 0.3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <motion.button
                    className="w-full px-6 py-4 bg-gradient-to-r from-primary via-neon-blue to-primary bg-[length:200%_100%] text-primary-foreground rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
                    animate={{ 
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      scale: [1, 1.01, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Generate Strategy
                    </span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Processing Animation - Enhanced */}
            <AnimatePresence>
              {animationPhase === 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl border border-primary/30 rounded-2xl p-8 space-y-6 shadow-2xl"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-neon-blue/20"
                    >
                      <Sparkles className="w-7 h-7 text-primary" />
                    </motion.div>
                    <div>
                      <h4 className="font-bold text-lg">Analyzing keyword opportunities</h4>
                      <p className="text-sm text-muted-foreground">This will take just a moment...</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Gradient Progress Bar */}
                    <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, ease: 'easeInOut' }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-neon-blue to-neon-pink rounded-full shadow-lg"
                      />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>

                    {/* Checkmark Steps */}
                    <div className="space-y-3">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5, type: 'spring' }}
                        >
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        </motion.div>
                        <span className="font-medium">Analyzing 1,247 keywords</span>
                        <motion.div
                          className="ml-auto px-2 py-1 rounded-full bg-success text-success-foreground text-xs font-bold"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          Done
                        </motion.div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1, type: 'spring' }}
                        >
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        </motion.div>
                        <span className="font-medium">Checking SERP data</span>
                        <motion.div
                          className="ml-auto px-2 py-1 rounded-full bg-success text-success-foreground text-xs font-bold"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.1 }}
                        >
                          Done
                        </motion.div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.3 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1.5, type: 'spring' }}
                        >
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        </motion.div>
                        <span className="font-medium">Calculating priorities</span>
                        <motion.div
                          className="ml-auto px-2 py-1 rounded-full bg-success text-success-foreground text-xs font-bold"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.6 }}
                        >
                          Done
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Proposal Cards - Enhanced */}
            <AnimatePresence>
              {animationPhase >= 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {mockProposals.map((proposal, index) => (
                    <motion.div
                      key={proposal.title}
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: index * 0.2,
                        type: 'spring',
                        stiffness: 200,
                        damping: 20
                      }}
                      className="relative group"
                    >
                      {/* Glowing Border Effect */}
                      <motion.div
                        className="absolute -inset-0.5 bg-gradient-to-r from-primary via-neon-blue to-neon-pink rounded-2xl opacity-20 group-hover:opacity-40 blur transition-opacity"
                        animate={{
                          opacity: [0.2, 0.3, 0.2]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.3
                        }}
                      />
                      
                      <div className="relative bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 space-y-4 shadow-xl hover:shadow-2xl transition-shadow">
                        {/* Priority Badge */}
                        <div className="flex items-start justify-between gap-4">
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3 + index * 0.2, type: 'spring' }}
                            className="flex items-center gap-2"
                          >
                            <span
                              className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-lg ${
                                proposal.priorityColor === 'success'
                                  ? 'bg-gradient-to-r from-success to-success/80 text-success-foreground'
                                  : 'bg-gradient-to-r from-primary to-neon-blue text-primary-foreground'
                              }`}
                            >
                              {proposal.priority}
                            </span>
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            >
                              <Zap className="w-4 h-4 text-primary" />
                            </motion.div>
                          </motion.div>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                          {proposal.title}
                        </h4>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gradient-to-br from-primary/10 to-neon-blue/10 border border-primary/20 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-primary" />
                              <span className="text-xs text-muted-foreground font-medium">Estimated</span>
                            </div>
                            <div className="text-2xl font-bold text-primary">
                              {(proposal.impressions / 1000).toFixed(1)}K
                            </div>
                            <div className="text-xs text-muted-foreground">impressions/mo</div>
                          </div>

                          <div className="bg-gradient-to-br from-neon-pink/10 to-primary/10 border border-neon-pink/20 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-neon-pink" />
                              <span className="text-xs text-muted-foreground font-medium">Type</span>
                            </div>
                            <div className="text-lg font-bold text-neon-pink">
                              {proposal.contentType}
                            </div>
                          </div>
                        </div>

                        {/* Keywords Section */}
                        <div className="space-y-3 pt-4 border-t border-border/50">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Target className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-muted-foreground mb-1">Primary Keyword</div>
                              <code className="text-sm bg-muted/80 px-3 py-1.5 rounded-lg font-semibold inline-block border border-border/50">
                                {proposal.primaryKeyword}
                              </code>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-neon-blue/10">
                              <Sparkles className="w-4 h-4 text-neon-blue" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Secondary:</span>
                              <span className="px-2 py-1 rounded-full bg-neon-blue/20 text-neon-blue text-sm font-bold">
                                {proposal.secondaryCount} keywords
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {animationPhase >= 3 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.2 }}
                            className="flex gap-3 pt-2"
                          >
                            <button className="flex-1 px-5 py-3 bg-gradient-to-r from-primary to-neon-blue text-primary-foreground rounded-xl text-sm font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 group">
                              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                              Create Content
                            </button>
                            <button className="px-4 py-3 border-2 border-border/50 hover:border-primary/50 rounded-xl text-sm font-medium hover:bg-muted/50 transition-all">
                              <Calendar className="w-4 h-4" />
                            </button>
                            <button className="px-4 py-3 border-2 border-border/50 hover:border-neon-blue/50 rounded-xl text-sm font-medium hover:bg-muted/50 transition-all">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Success Message */}
                  {animationPhase >= 4 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.8, type: 'spring' }}
                      className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-success/20 via-success/10 to-transparent border border-success/30 shadow-lg"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <CheckCircle2 className="w-6 h-6 text-success" />
                      </motion.div>
                      <span className="text-sm font-bold text-success">
                        8 proposals generated • Ready to create
                      </span>
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-5 h-5 text-success" />
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};