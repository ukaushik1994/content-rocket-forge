import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, BarChart3, TrendingUp, Zap, MessageSquare, Sparkles, ExternalLink, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const mockChartData = [
  { label: 'Article 1', value: 8500, color: 'hsl(var(--primary))' },
  { label: 'Article 2', value: 7200, color: 'hsl(var(--neon-blue))' },
  { label: 'Article 3', value: 6800, color: 'hsl(var(--neon-pink))' },
  { label: 'Article 4', value: 5400, color: 'hsl(var(--primary))' },
  { label: 'Article 5', value: 4900, color: 'hsl(var(--neon-blue))' },
];

export const AIChatDemo = () => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const phases = [0, 1, 2, 3, 4, 5];
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
          <h3 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-neon-blue bg-clip-text text-transparent">
            Ask. Visualize. Act.
          </h3>
          <p className="text-muted-foreground text-lg">
            Ask questions in plain English. Get multi-chart analysis with actionable recommendations.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Multi-Perspective Analysis</h4>
              <p className="text-sm text-muted-foreground">
                AI generates 2-4 related charts for comprehensive insights
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-neon-blue/10 text-neon-blue">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Smart Chart Detection</h4>
              <p className="text-sm text-muted-foreground">
                Automatically chooses the best visualization for your data
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-neon-pink/10 text-neon-pink">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Contextual Actions</h4>
              <p className="text-sm text-muted-foreground">
                Every insight comes with actionable next steps
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Conversation Memory</h4>
              <p className="text-sm text-muted-foreground">
                AI remembers context and builds on previous insights
              </p>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full sm:w-auto"
          onClick={() => navigate('/ai-chat')}
        >
          Try AI Chat
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
          {/* Mock Chat Interface */}
          <div className="p-6 space-y-4 min-h-[600px]">
            {/* User Message */}
            <AnimatePresence>
              {animationPhase >= 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-end"
                >
                  <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3">
                    <p className="text-sm">Show me my top performing content by impressions</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Thinking */}
            <AnimatePresence>
              {animationPhase === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-neon-blue flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        🤔 Analyzing your content performance...
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Response with Chart */}
            <AnimatePresence>
              {animationPhase >= 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-neon-blue flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                        <p className="text-sm">
                          Here's your top performing content analysis. I've generated 3 perspectives:
                        </p>
                      </div>

                      {/* Chart */}
                      {animationPhase >= 3 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-card border border-border/50 rounded-xl p-4"
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            <h4 className="font-semibold text-sm">Top 5 Content by Impressions</h4>
                          </div>
                          <div className="space-y-3">
                            {mockChartData.map((item, index) => (
                              <motion.div
                                key={item.label}
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="space-y-1"
                              >
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">{item.label}</span>
                                  <span className="font-semibold">{item.value.toLocaleString()}</span>
                                </div>
                                <div className="h-8 bg-muted rounded-md overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(item.value / 8500) * 100}%` }}
                                    transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                                    className="h-full rounded-md"
                                    style={{ background: item.color }}
                                  />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Metric Cards */}
                      {animationPhase >= 4 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="grid grid-cols-3 gap-2"
                        >
                          <div className="bg-card border border-border/50 rounded-lg p-3">
                            <div className="text-xl font-bold text-primary">45.2K</div>
                            <div className="text-xs text-muted-foreground">Total Impressions</div>
                            <div className="text-xs text-success">+12%</div>
                          </div>
                          <div className="bg-card border border-border/50 rounded-lg p-3">
                            <div className="text-xl font-bold text-neon-blue">3.4%</div>
                            <div className="text-xs text-muted-foreground">Avg Click Rate</div>
                            <div className="text-xs text-success">+0.8%</div>
                          </div>
                          <div className="bg-card border border-border/50 rounded-lg p-3">
                            <div className="text-xl font-bold text-neon-pink">3</div>
                            <div className="text-xs text-muted-foreground">Quick Wins</div>
                            <div className="text-xs text-primary">Opportunities</div>
                          </div>
                        </motion.div>
                      )}

                      {/* Action Buttons */}
                      {animationPhase >= 5 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="flex flex-wrap gap-2"
                        >
                          <button className="px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Create Similar Content
                          </button>
                          <button className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Analyze Competitors
                          </button>
                          <button className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            Export to PDF
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
