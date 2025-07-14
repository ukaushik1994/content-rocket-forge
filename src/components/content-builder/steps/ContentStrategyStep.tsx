import React, { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Target, Users, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const ContentStrategyStep = () => {
  const { state, setContentStrategy, markStepCompleted } = useContentBuilder();
  const { contentStrategy } = state;

  const [targetAudience, setTargetAudience] = useState(contentStrategy?.targetAudience || '');
  const [contentGoals, setContentGoals] = useState(contentStrategy?.contentGoals || []);
  const [businessObjectives, setBusinessObjectives] = useState(contentStrategy?.businessObjectives || '');
  const [competitorAnalysis, setCompetitorAnalysis] = useState(contentStrategy?.competitorAnalysis || '');
  const [contentPillars, setContentPillars] = useState(contentStrategy?.contentPillars || []);
  const [publishingSchedule, setPublishingSchedule] = useState(contentStrategy?.publishingSchedule || 'weekly');
  const [targetFunnelStage, setTargetFunnelStage] = useState(contentStrategy?.targetFunnelStage || 'awareness');

  const availableGoals = [
    'Brand Awareness',
    'Lead Generation',
    'Customer Education',
    'Thought Leadership',
    'Product Promotion',
    'SEO/Organic Traffic',
    'Customer Retention',
    'Community Building'
  ];

  const funnelStages = [
    { value: 'awareness', label: 'Awareness (Top of Funnel)' },
    { value: 'consideration', label: 'Consideration (Middle of Funnel)' },
    { value: 'decision', label: 'Decision (Bottom of Funnel)' },
    { value: 'retention', label: 'Retention (Post-Purchase)' }
  ];

  const publishingFrequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const handleGoalToggle = (goal: string) => {
    setContentGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleAddContentPillar = () => {
    if (contentPillars.length < 5) {
      setContentPillars([...contentPillars, '']);
    }
  };

  const handleContentPillarChange = (index: number, value: string) => {
    const updated = [...contentPillars];
    updated[index] = value;
    setContentPillars(updated.filter(pillar => pillar.trim() !== ''));
  };

  const handleSaveStrategy = () => {
    if (!targetAudience.trim()) {
      toast.error('Please define your target audience');
      return;
    }

    if (contentGoals.length === 0) {
      toast.error('Please select at least one content goal');
      return;
    }

    const strategy = {
      targetAudience: targetAudience.trim(),
      contentGoals,
      businessObjectives: businessObjectives.trim(),
      competitorAnalysis: competitorAnalysis.trim(),
      contentPillars: contentPillars.filter(p => p.trim() !== ''),
      publishingSchedule,
      targetFunnelStage
    };

    setContentStrategy(strategy);
    markStepCompleted(0);
    toast.success('Content strategy saved successfully!');
  };

  const isValid = targetAudience.trim() && contentGoals.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Target className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Content Strategy Foundation
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Define your content strategy to create more targeted and effective content that aligns with your business goals.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Target Audience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Target Audience
            </CardTitle>
            <CardDescription>
              Define who you're creating content for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="audience">Describe your target audience</Label>
              <Textarea
                id="audience"
                placeholder="e.g., Small business owners in the tech industry, aged 30-45, looking for productivity solutions..."
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Content Goals
            </CardTitle>
            <CardDescription>
              Select your primary content objectives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {availableGoals.map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={contentGoals.includes(goal)}
                    onCheckedChange={() => handleGoalToggle(goal)}
                  />
                  <Label htmlFor={goal} className="text-sm font-normal">
                    {goal}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Business Objectives */}
        <Card>
          <CardHeader>
            <CardTitle>Business Objectives</CardTitle>
            <CardDescription>
              How does this content support your business goals?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Increase qualified leads by 25%, improve brand recognition in target market..."
              value={businessObjectives}
              onChange={(e) => setBusinessObjectives(e.target.value)}
              className="min-h-[80px]"
            />
          </CardContent>
        </Card>

        {/* Funnel Stage */}
        <Card>
          <CardHeader>
            <CardTitle>Target Funnel Stage</CardTitle>
            <CardDescription>
              Which stage of the customer journey are you targeting?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={targetFunnelStage} onValueChange={(value: 'awareness' | 'consideration' | 'decision' | 'retention') => setTargetFunnelStage(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {funnelStages.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Content Pillars */}
      <Card>
        <CardHeader>
          <CardTitle>Content Pillars</CardTitle>
          <CardDescription>
            Define 3-5 key themes that your content will focus on
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {contentPillars.map((pillar, index) => (
              <Input
                key={index}
                placeholder={`Content pillar ${index + 1}`}
                value={pillar}
                onChange={(e) => handleContentPillarChange(index, e.target.value)}
              />
            ))}
          </div>
          {contentPillars.length < 5 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleAddContentPillar}
              className="w-full"
            >
              Add Content Pillar
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Publishing Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Publishing Strategy
          </CardTitle>
          <CardDescription>
            Define your content publishing approach
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Publishing Frequency</Label>
            <Select value={publishingSchedule} onValueChange={(value: 'daily' | 'weekly' | 'biweekly' | 'monthly') => setPublishingSchedule(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {publishingFrequencies.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="competitor-analysis">Competitor Analysis</Label>
            <Textarea
              id="competitor-analysis"
              placeholder="List key competitors and what content strategies they're using..."
              value={competitorAnalysis}
              onChange={(e) => setCompetitorAnalysis(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Selected Goals Display */}
      {contentGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {contentGoals.map((goal) => (
                <Badge key={goal} variant="secondary">
                  {goal}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Strategy */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={handleSaveStrategy}
          disabled={!isValid}
          className="px-8 py-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Save Content Strategy
        </Button>
      </div>
    </div>
  );
};