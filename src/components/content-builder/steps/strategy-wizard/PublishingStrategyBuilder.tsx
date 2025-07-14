
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, TrendingUp, BarChart3 } from 'lucide-react';

interface PublishingStrategyBuilderProps {
  data: any;
  onChange: (data: any) => void;
}

const funnelStages = [
  {
    value: 'awareness',
    label: 'Awareness (Top of Funnel)',
    description: 'Attract new audiences and build brand recognition',
    contentTypes: ['Blog posts', 'Social media', 'Video content', 'Infographics'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    value: 'consideration',
    label: 'Consideration (Middle of Funnel)',
    description: 'Educate prospects and build trust',
    contentTypes: ['Whitepapers', 'Webinars', 'Case studies', 'Comparison guides'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    value: 'decision',
    label: 'Decision (Bottom of Funnel)',
    description: 'Convert prospects into customers',
    contentTypes: ['Product demos', 'Free trials', 'Testimonials', 'Pricing guides'],
    color: 'from-green-500 to-emerald-500'
  },
  {
    value: 'retention',
    label: 'Retention (Post-Purchase)',
    description: 'Keep customers engaged and encourage loyalty',
    contentTypes: ['Tutorials', 'Success stories', 'Community content', 'Updates'],
    color: 'from-orange-500 to-red-500'
  }
];

const publishingFrequencies = [
  {
    value: 'daily',
    label: 'Daily',
    description: 'High-volume content strategy',
    commitment: 'Very High',
    resources: '3-5 hours/day',
    bestFor: ['Social media brands', 'News/Media', 'High-engagement communities']
  },
  {
    value: 'weekly',
    label: 'Weekly',
    description: 'Consistent, sustainable approach',
    commitment: 'Medium',
    resources: '5-10 hours/week',
    bestFor: ['Most businesses', 'Thought leadership', 'Educational content']
  },
  {
    value: 'biweekly',
    label: 'Bi-weekly',
    description: 'Quality-focused content creation',
    commitment: 'Low-Medium',
    resources: '8-15 hours/bi-week',
    bestFor: ['B2B companies', 'Complex topics', 'In-depth analysis']
  },
  {
    value: 'monthly',
    label: 'Monthly',
    description: 'Premium, comprehensive content',
    commitment: 'Low',
    resources: '15-25 hours/month',
    bestFor: ['Specialized industries', 'Research-heavy content', 'Consultancies']
  }
];

export const PublishingStrategyBuilder: React.FC<PublishingStrategyBuilderProps> = ({
  data,
  onChange
}) => {
  const [selectedFrequency, setSelectedFrequency] = useState(data.publishingSchedule || 'weekly');
  const [selectedFunnelStage, setSelectedFunnelStage] = useState(data.targetFunnelStage || 'awareness');
  const [competitorAnalysis, setCompetitorAnalysis] = useState(data.competitorAnalysis || '');
  const [businessObjectives, setBusinessObjectives] = useState(data.businessObjectives || '');

  const handleFrequencyChange = (frequency: string) => {
    setSelectedFrequency(frequency);
    onChange({
      ...data,
      publishingSchedule: frequency
    });
  };

  const handleFunnelStageChange = (stage: string) => {
    setSelectedFunnelStage(stage);
    onChange({
      ...data,
      targetFunnelStage: stage
    });
  };

  const handleCompetitorAnalysisChange = (analysis: string) => {
    setCompetitorAnalysis(analysis);
    onChange({
      ...data,
      competitorAnalysis: analysis
    });
  };

  const handleBusinessObjectivesChange = (objectives: string) => {
    setBusinessObjectives(objectives);
    onChange({
      ...data,
      businessObjectives: objectives
    });
  };

  const selectedFrequencyData = publishingFrequencies.find(f => f.value === selectedFrequency);
  const selectedFunnelData = funnelStages.find(f => f.value === selectedFunnelStage);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <Calendar className="h-8 w-8 text-neon-yellow" />
          <h2 className="text-3xl font-bold text-gradient">Publishing Strategy</h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Define your content publishing approach and target funnel stage
        </p>
      </motion.div>

      {/* Publishing Frequency */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-neon-blue" />
              Publishing Frequency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {publishingFrequencies.map((frequency, index) => {
                const isSelected = selectedFrequency === frequency.value;
                
                return (
                  <motion.div
                    key={frequency.value}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`cursor-pointer transition-all duration-300 ${
                      isSelected ? 'scale-105' : ''
                    }`}
                    onClick={() => handleFrequencyChange(frequency.value)}
                  >
                    <Card className={`h-full transition-all duration-300 ${
                      isSelected 
                        ? 'border-neon-blue shadow-neon-glow bg-gradient-to-br from-neon-blue/10 to-transparent' 
                        : 'border-white/10 hover:border-white/30 bg-glass'
                    }`}>
                      <CardContent className="p-4">
                        <div className="text-center space-y-3">
                          <h4 className="font-semibold text-white text-lg">{frequency.label}</h4>
                          <p className="text-sm text-muted-foreground">{frequency.description}</p>
                          
                          <div className="space-y-2">
                            <Badge variant={
                              frequency.commitment === 'Very High' ? 'destructive' :
                              frequency.commitment === 'High' ? 'secondary' :
                              frequency.commitment === 'Medium' ? 'default' : 'outline'
                            }>
                              {frequency.commitment} Commitment
                            </Badge>
                            
                            <div className="text-xs text-muted-foreground">
                              <div className="font-medium text-white">Time Required:</div>
                              {frequency.resources}
                            </div>
                          </div>
                          
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t border-white/10 pt-3 space-y-2"
                              >
                                <div className="text-xs text-muted-foreground">Best for:</div>
                                <div className="space-y-1">
                                  {frequency.bestFor.map((item, i) => (
                                    <div key={i} className="text-xs text-white flex items-center gap-1">
                                      <div className="w-1 h-1 bg-neon-blue rounded-full" />
                                      {item}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {selectedFrequencyData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 rounded-lg border border-white/10"
              >
                <h4 className="font-medium text-white mb-2">Selected: {selectedFrequencyData.label}</h4>
                <p className="text-sm text-muted-foreground">{selectedFrequencyData.description}</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Target Funnel Stage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-neon-purple" />
              Target Funnel Stage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {funnelStages.map((stage, index) => {
                const isSelected = selectedFunnelStage === stage.value;
                
                return (
                  <motion.div
                    key={stage.value}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`cursor-pointer transition-all duration-300 ${
                      isSelected ? 'scale-105' : ''
                    }`}
                    onClick={() => handleFunnelStageChange(stage.value)}
                  >
                    <Card className={`h-full transition-all duration-300 ${
                      isSelected 
                        ? 'border-neon-purple shadow-neon-glow bg-gradient-to-br from-neon-purple/10 to-transparent' 
                        : 'border-white/10 hover:border-white/30 bg-glass'
                    }`}>
                      <CardContent className="p-4">
                        <div className={`w-full h-2 bg-gradient-to-r ${stage.color} rounded-full mb-4`} />
                        
                        <h4 className="font-semibold text-white mb-2">{stage.label}</h4>
                        <p className="text-sm text-muted-foreground mb-4">{stage.description}</p>
                        
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-white">Content Types:</div>
                          <div className="flex flex-wrap gap-1">
                            {stage.contentTypes.map((type, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
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

      {/* Business Objectives */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-neon-green" />
              Business Objectives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe how your content strategy aligns with your business goals... e.g., Increase qualified leads by 25%, improve brand recognition in target market, reduce customer acquisition cost..."
              value={businessObjectives}
              onChange={(e) => handleBusinessObjectivesChange(e.target.value)}
              className="min-h-[100px] bg-glass border-white/10 focus:border-neon-blue/50 resize-none"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Competitor Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle>Competitor Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Analyze your competitors' content strategies... Who are your main competitors? What content formats do they use? What gaps can you fill? What can you do better?"
              value={competitorAnalysis}
              onChange={(e) => handleCompetitorAnalysisChange(e.target.value)}
              className="min-h-[100px] bg-glass border-white/10 focus:border-neon-blue/50 resize-none"
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
