import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, TrendingUp, Calendar, FileText, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
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
          {/* Proposal Container */}
          <div className="p-6 space-y-6 h-[550px] md:h-[650px] overflow-hidden">
            {/* Goal Input */}
            <AnimatePresence>
              {animationPhase >= 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Monthly Traffic Goal
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value="50,000 visits"
                      readOnly
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-lg font-semibold"
                    />
                  </div>
                  <motion.button
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Generate Strategy
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Processing Animation */}
            <AnimatePresence>
              {animationPhase === 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-muted/50 border border-border rounded-xl p-6 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-6 h-6 text-primary" />
                    </motion.div>
                    <span className="font-semibold">Analyzing keyword opportunities...</span>
                  </div>

                  <div className="space-y-2">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2 }}
                      className="h-2 bg-primary rounded-full"
                    />
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        Analyzing 1,247 keywords
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        Checking SERP data
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        Calculating priorities
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Proposal Cards */}
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
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="bg-card border border-border rounded-xl p-5 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-md ${
                                proposal.priorityColor === 'success'
                                  ? 'bg-success/10 text-success'
                                  : 'bg-primary/10 text-primary'
                              }`}
                            >
                              {proposal.priority}
                            </span>
                          </div>
                          <h4 className="font-semibold text-lg mb-3">{proposal.title}</h4>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Estimated:</span>
                              <span className="font-semibold">
                                {proposal.impressions.toLocaleString()}/mo
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Type:</span>
                              <span className="font-semibold">{proposal.contentType}</span>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-border space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Target className="w-3 h-3 text-primary" />
                              <span className="text-muted-foreground">Primary:</span>
                              <code className="text-xs bg-muted px-2 py-0.5 rounded">
                                {proposal.primaryKeyword}
                              </code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-3 h-3 text-neon-blue" />
                              <span className="text-muted-foreground">Secondary:</span>
                              <span className="font-semibold">{proposal.secondaryCount} keywords</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {animationPhase >= 3 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + index * 0.2 }}
                          className="flex gap-2"
                        >
                          <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                            Create Content
                          </button>
                          <button className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                            <Calendar className="w-4 h-4" />
                          </button>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}

                  {animationPhase >= 4 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="flex items-center justify-center gap-2 text-sm text-success font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      8 proposals generated • Ready to create
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
