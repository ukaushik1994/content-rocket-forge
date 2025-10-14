import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, BarChart3, TrendingUp, Zap, MessageSquare, Sparkles, ExternalLink, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { label: 'Art 1', value: 5200 },
  { label: 'Art 2', value: 6400 },
  { label: 'Art 3', value: 7800 },
  { label: 'Art 4', value: 7200 },
  { label: 'Art 5', value: 8500 },
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
          <div className="p-6 space-y-4 h-[600px] overflow-y-auto">
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

                      {/* Chart - Modern Gradient Area Chart */}
                      {animationPhase >= 3 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-primary/20 rounded-2xl p-6 shadow-2xl"
                        >
                          <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-base">Performance Trend Analysis</h4>
                              <p className="text-xs text-muted-foreground">Top 5 content impressions over time</p>
                            </div>
                          </div>
                          
                          <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart 
                                data={mockChartData}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                              >
                                {/* Gradient Definition */}
                                <defs>
                                  <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                                    <stop offset="50%" stopColor="hsl(var(--neon-blue))" stopOpacity={0.2}/>
                                    <stop offset="100%" stopColor="hsl(var(--neon-pink))" stopOpacity={0.05}/>
                                  </linearGradient>
                                  <filter id="glow">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                    <feMerge>
                                      <feMergeNode in="coloredBlur"/>
                                      <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                  </filter>
                                </defs>
                                
                                {/* Grid */}
                                <CartesianGrid 
                                  strokeDasharray="3 3" 
                                  stroke="hsl(var(--border))" 
                                  strokeOpacity={0.3}
                                  vertical={false}
                                />
                                
                                {/* Axes */}
                                <XAxis 
                                  dataKey="label" 
                                  stroke="hsl(var(--muted-foreground))"
                                  fontSize={11}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis 
                                  stroke="hsl(var(--muted-foreground))"
                                  fontSize={11}
                                  tickLine={false}
                                  axisLine={false}
                                  tickFormatter={(value) => `${(value/1000).toFixed(1)}K`}
                                />
                                
                                {/* Tooltip */}
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--primary))',
                                    borderRadius: '12px',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                    padding: '12px'
                                  }}
                                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                                  formatter={(value: any) => [`${value.toLocaleString()} impressions`, 'Performance']}
                                />
                                
                                {/* Area with Animation */}
                                <Area
                                  type="monotone"
                                  dataKey="value"
                                  stroke="hsl(var(--primary))"
                                  strokeWidth={3}
                                  fill="url(#colorImpressions)"
                                  filter="url(#glow)"
                                  animationDuration={1500}
                                  animationBegin={0}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          
                          {/* Legend with Gradient Pills */}
                          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                              <span className="text-xs font-medium">High Performance</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-blue/10 border border-neon-blue/20">
                              <div className="w-2 h-2 rounded-full bg-neon-blue" />
                              <span className="text-xs font-medium">Trending Up</span>
                            </div>
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
