import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const platforms = ['Blog Post', 'Social Media', 'Email', 'Video Script'];
const suggestions = [
  'AI in Healthcare',
  'Content Marketing Trends',
  'E-commerce Growth',
  'Remote Work Benefits'
];

const mockMetrics = [
  { label: 'SEO Score', value: 0, target: 94 },
  { label: 'Readability', value: 0, target: 87 },
  { label: 'Engagement', value: 0, target: 92 }
];

export const InteractiveContentMock = () => {
  const [currentTopic, setCurrentTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('Blog Post');
  const [metrics, setMetrics] = useState(mockMetrics);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Animate metrics
    const animateMetrics = () => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.min(metric.value + Math.random() * 10 + 5, metric.target)
      })));
    };
    
    const interval = setInterval(animateMetrics, 100);
    
    setTimeout(() => {
      clearInterval(interval);
      setIsGenerating(false);
      setMetrics(prev => prev.map(metric => ({ ...metric, value: metric.target })));
    }, 2000);
  };

  return (
    <div className="space-y-6 p-6 bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50">
      {/* Topic Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Content Topic</label>
        <div className="relative">
          <input
            type="text"
            value={currentTopic}
            onChange={(e) => setCurrentTopic(e.target.value)}
            placeholder="Enter your topic..."
            className="w-full px-4 py-3 bg-background/50 border border-border/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
          />
          <AnimatePresence>
            <motion.div 
              key={suggestionIndex}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute right-3 top-3 text-sm text-muted-foreground pointer-events-none"
            >
              {!currentTopic && `Try: ${suggestions[suggestionIndex]}`}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Platform Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Platform</label>
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => (
            <Button
              key={platform}
              variant={selectedPlatform === platform ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPlatform(platform)}
              className="text-xs"
            >
              {platform}
            </Button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !currentTopic}
        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
      >
        {isGenerating ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing & Generating...
          </div>
        ) : (
          'Generate Content'
        )}
      </Button>

      {/* Live Metrics */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-foreground">Real-time Analysis</div>
        <div className="space-y-2">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{metric.label}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-background rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary/80"
                    initial={{ width: 0 }}
                    animate={{ width: `${(metric.value / metric.target) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-xs font-medium text-primary min-w-[2rem] text-right">
                  {Math.round(metric.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};