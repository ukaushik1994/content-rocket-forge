
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Columns, Plus, X, Lightbulb, Palette, Target } from 'lucide-react';

interface ContentPillarDesignerProps {
  data: any;
  onChange: (data: any) => void;
}

const pillarTemplates = {
  'Educational': {
    color: 'from-blue-500 to-cyan-500',
    icon: '📚',
    description: 'How-to guides, tutorials, and educational content',
    examples: ['Step-by-step tutorials', 'Industry insights', 'Best practices', 'Tips & tricks']
  },
  'Inspirational': {
    color: 'from-purple-500 to-pink-500',
    icon: '✨',
    description: 'Motivational and inspirational content',
    examples: ['Success stories', 'Quotes', 'Behind-the-scenes', 'Vision content']
  },
  'Entertainment': {
    color: 'from-green-500 to-emerald-500',
    icon: '🎭',
    description: 'Fun, engaging, and entertaining content',
    examples: ['Memes', 'Games', 'Challenges', 'Funny stories']
  },
  'Promotional': {
    color: 'from-orange-500 to-red-500',
    icon: '📢',
    description: 'Product announcements and promotional content',
    examples: ['Product launches', 'Special offers', 'Features highlights', 'Testimonials']
  },
  'Community': {
    color: 'from-teal-500 to-blue-500',
    icon: '👥',
    description: 'Community-focused and user-generated content',
    examples: ['User spotlights', 'Q&As', 'Polls', 'Community challenges']
  }
};

export const ContentPillarDesigner: React.FC<ContentPillarDesignerProps> = ({
  data,
  onChange
}) => {
  const [customPillars, setCustomPillars] = useState<string[]>(data.contentPillars || []);
  const [newPillar, setNewPillar] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  const handleTemplateToggle = (template: string) => {
    const updated = selectedTemplates.includes(template)
      ? selectedTemplates.filter(t => t !== template)
      : [...selectedTemplates, template];
    
    setSelectedTemplates(updated);
    
    // Update the data with combined templates and custom pillars
    const allPillars = [...updated, ...customPillars.filter(p => p.trim())];
    onChange({
      ...data,
      contentPillars: allPillars
    });
  };

  const addCustomPillar = () => {
    if (newPillar.trim() && !customPillars.includes(newPillar.trim())) {
      const updated = [...customPillars, newPillar.trim()];
      setCustomPillars(updated);
      setNewPillar('');
      
      const allPillars = [...selectedTemplates, ...updated];
      onChange({
        ...data,
        contentPillars: allPillars
      });
    }
  };

  const removeCustomPillar = (index: number) => {
    const updated = customPillars.filter((_, i) => i !== index);
    setCustomPillars(updated);
    
    const allPillars = [...selectedTemplates, ...updated];
    onChange({
      ...data,
      contentPillars: allPillars
    });
  };

  const allPillars = [...selectedTemplates, ...customPillars.filter(p => p.trim())];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <Columns className="h-8 w-8 text-neon-green" />
          <h2 className="text-3xl font-bold text-gradient">Content Pillars</h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Create 3-5 content themes that will guide your content creation strategy
        </p>
      </motion.div>

      {/* Pillar Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-neon-purple" />
              Choose from Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(pillarTemplates).map(([name, template], index) => {
                const isSelected = selectedTemplates.includes(name);
                
                return (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`cursor-pointer transition-all duration-300 ${
                      isSelected ? 'scale-105' : ''
                    }`}
                    onClick={() => handleTemplateToggle(name)}
                  >
                    <Card className={`h-full transition-all duration-300 ${
                      isSelected 
                        ? 'border-neon-blue shadow-neon-glow bg-gradient-to-br from-neon-blue/10 to-transparent' 
                        : 'border-white/10 hover:border-white/30 bg-glass'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${template.color} bg-opacity-20`}>
                            <span className="text-2xl">{template.icon}</span>
                          </div>
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                className="w-5 h-5 bg-neon-blue rounded-full flex items-center justify-center"
                              >
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        
                        <h4 className="font-semibold text-white mb-2">{name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        
                        <div className="space-y-1">
                          {template.examples.map((example, i) => (
                            <div key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                              <div className="w-1 h-1 bg-current rounded-full" />
                              {example}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Custom Pillars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-neon-yellow" />
              Add Custom Pillars
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter a custom content pillar..."
                value={newPillar}
                onChange={(e) => setNewPillar(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomPillar()}
                className="bg-glass border-white/10 focus:border-neon-blue/50"
              />
              <Button
                onClick={addCustomPillar}
                disabled={!newPillar.trim() || allPillars.length >= 5}
                className="bg-neon-blue hover:bg-neon-blue/80"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {customPillars.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Custom Pillars:</h4>
                <div className="flex flex-wrap gap-2">
                  {customPillars.map((pillar, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1 bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 px-3 py-1 rounded-full border border-white/20"
                    >
                      <span className="text-sm text-white">{pillar}</span>
                      <button
                        onClick={() => removeCustomPillar(index)}
                        className="text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pillars Overview */}
      {allPillars.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-neon-green" />
                Your Content Pillars ({allPillars.length}/5)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allPillars.map((pillar, index) => (
                  <motion.div
                    key={pillar}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 p-4 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <h4 className="font-medium text-white">{pillar}</h4>
                    </div>
                    
                    {pillarTemplates[pillar as keyof typeof pillarTemplates] && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {pillarTemplates[pillar as keyof typeof pillarTemplates].description}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {allPillars.length < 3 && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-sm text-amber-400">
                    💡 Tip: We recommend having at least 3 content pillars for a well-rounded strategy.
                  </p>
                </div>
              )}
              
              {allPillars.length >= 5 && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400">
                    ✅ Perfect! You have a comprehensive set of content pillars.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
