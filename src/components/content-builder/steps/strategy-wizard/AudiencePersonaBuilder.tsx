
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Brain, Target, Plus, X } from 'lucide-react';

interface AudiencePersonaBuilderProps {
  data: any;
  onChange: (data: any) => void;
}

const audienceTemplates = [
  {
    title: 'Small Business Owners',
    description: 'Entrepreneurs running small to medium businesses',
    persona: 'Small business owners aged 30-50, managing teams of 5-50 employees, focused on growth and efficiency. They value practical solutions and ROI-driven decisions.',
    icon: '👔'
  },
  {
    title: 'Marketing Professionals',
    description: 'Digital marketing specialists and managers',
    persona: 'Marketing professionals aged 25-40, working in agencies or in-house teams. They stay updated with latest trends and seek innovative strategies to improve campaign performance.',
    icon: '📊'
  },
  {
    title: 'Content Creators',
    description: 'Bloggers, YouTubers, and social media influencers',
    persona: 'Content creators aged 20-35, building personal brands and monetizing their audience. They need tools for content planning, SEO optimization, and audience engagement.',
    icon: '🎬'
  },
  {
    title: 'E-commerce Owners',
    description: 'Online store owners and product sellers',
    persona: 'E-commerce entrepreneurs aged 25-45, running online stores with 10-10,000 products. They focus on conversion optimization, customer acquisition, and retention strategies.',
    icon: '🛒'
  }
];

const demographicOptions = [
  { category: 'Age Range', options: ['18-24', '25-34', '35-44', '45-54', '55+'] },
  { category: 'Industry', options: ['Technology', 'Healthcare', 'Finance', 'Retail', 'Education', 'Manufacturing'] },
  { category: 'Company Size', options: ['Solo', '2-10', '11-50', '51-200', '200+'] },
  { category: 'Role Level', options: ['Individual Contributor', 'Manager', 'Director', 'VP/C-Level', 'Founder'] }
];

export const AudiencePersonaBuilder: React.FC<AudiencePersonaBuilderProps> = ({
  data,
  onChange
}) => {
  const [selectedDemographics, setSelectedDemographics] = useState<Record<string, string[]>>({});
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [newPainPoint, setNewPainPoint] = useState('');

  const handleTemplateSelect = (template: typeof audienceTemplates[0]) => {
    onChange({
      ...data,
      targetAudience: template.persona
    });
  };

  const handleDemographicToggle = (category: string, option: string) => {
    const current = selectedDemographics[category] || [];
    const updated = current.includes(option)
      ? current.filter(item => item !== option)
      : [...current, option];
    
    setSelectedDemographics({
      ...selectedDemographics,
      [category]: updated
    });
  };

  const addPainPoint = () => {
    if (newPainPoint.trim()) {
      setPainPoints([...painPoints, newPainPoint.trim()]);
      setNewPainPoint('');
    }
  };

  const removePainPoint = (index: number) => {
    setPainPoints(painPoints.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <Users className="h-8 w-8 text-neon-blue" />
          <h2 className="text-3xl font-bold text-gradient">Define Your Audience</h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Understanding your audience is the foundation of effective content strategy
        </p>
      </motion.div>

      {/* Quick Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-neon-purple" />
              Quick Start Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {audienceTemplates.map((template, index) => (
                <motion.div
                  key={template.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-glass rounded-lg border border-white/10 cursor-pointer hover:border-neon-blue/30 transition-all"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{template.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                      <p className="text-xs text-neon-blue">Click to use this template</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Demographics Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-neon-green" />
              Audience Demographics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {demographicOptions.map((category) => (
              <div key={category.category}>
                <h4 className="font-medium text-white mb-3">{category.category}</h4>
                <div className="flex flex-wrap gap-2">
                  {category.options.map((option) => (
                    <Badge
                      key={option}
                      variant={selectedDemographics[category.category]?.includes(option) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        selectedDemographics[category.category]?.includes(option)
                          ? 'bg-neon-blue text-white hover:bg-neon-blue/80'
                          : 'hover:border-neon-blue/50'
                      }`}
                      onClick={() => handleDemographicToggle(category.category, option)}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Custom Audience Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle>Detailed Audience Description</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe your target audience in detail... Include demographics, psychographics, behaviors, preferences, and any other relevant characteristics."
              value={data.targetAudience}
              onChange={(e) => onChange({ ...data, targetAudience: e.target.value })}
              className="min-h-[120px] bg-glass border-white/10 focus:border-neon-blue/50 resize-none"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Pain Points */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle>Audience Pain Points</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a pain point..."
                value={newPainPoint}
                onChange={(e) => setNewPainPoint(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPainPoint()}
                className="flex-1 px-3 py-2 bg-glass border border-white/10 rounded-md text-white placeholder-muted-foreground focus:border-neon-blue/50 focus:outline-none"
              />
              <Button onClick={addPainPoint} size="sm" className="bg-neon-blue hover:bg-neon-blue/80">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {painPoints.map((point, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 bg-red-500/20 text-red-300 border-red-500/30"
                >
                  {point}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-200"
                    onClick={() => removePainPoint(index)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
