import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const codeSnippets = [
  '// Analyzing SERP data...',
  'const content = ai.generate({',
  '  tone: "professional",',
  '  keywords: keywords,',
  '  format: "blog"',
  '});',
  '// Optimizing for SEO...',
  'if (engagement > 0.8) {',
  '  publish(content);',
  '}',
  '// Content generated successfully ✨',
  'const analytics = {',
  '  clicks: 2.4k,',
  '  impressions: 45.2k,',
  '  ctr: 5.3%',
  '};'
];

export const CodeStream = () => {
  const [visibleSnippets, setVisibleSnippets] = useState<Array<{
    id: string;
    text: string;
    x: number;
    y: number;
  }>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newSnippet = {
        id: Math.random().toString(36),
        text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
        x: Math.random() * 80 + 10, // 10-90% from left
        y: Math.random() * 60 + 20  // 20-80% from top
      };

      setVisibleSnippets(prev => [...prev, newSnippet]);

      // Remove after 4 seconds
      setTimeout(() => {
        setVisibleSnippets(prev => prev.filter(snippet => snippet.id !== newSnippet.id));
      }, 4000);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {visibleSnippets.map((snippet) => (
          <motion.div
            key={snippet.id}
            className="absolute font-mono text-sm text-primary/20 bg-background/5 backdrop-blur-sm rounded-md px-3 py-2 border border-primary/10"
            style={{
              left: `${snippet.x}%`,
              top: `${snippet.y}%`,
            }}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {snippet.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};