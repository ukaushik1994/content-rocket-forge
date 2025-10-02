/**
 * Personalization Dashboard
 * Main hub for AI personalization and ML features
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, Sparkles, Target, Settings2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { personalizationEngine, type PersonalizationProfile, type Recommendation } from '@/services/personalizationEngine';
import { mlPredictionEngine } from '@/services/mlPredictionEngine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export function PersonalizationDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<PersonalizationProfile | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPersonalizationData();
    }
  }, [user]);

  const loadPersonalizationData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load profile
      const userProfile = await personalizationEngine.getPersonalizationProfile(user.id);
      setProfile(userProfile);

      // Load recommendations
      const recs = await personalizationEngine.generateRecommendations(user.id, 'content_topic');
      setRecommendations(recs);

      // Load UI preferences
      const uiPrefs = await personalizationEngine.getUIPreferences(user.id);
      console.log('UI Preferences:', uiPrefs);

    } catch (error) {
      console.error('Error loading personalization data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load personalization data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrediction = async (type: string) => {
    if (!user) return;

    try {
      let prediction;
      
      if (type === 'content') {
        prediction = await mlPredictionEngine.predictContentPerformance(
          user.id,
          'example keyword'
        );
      } else if (type === 'workflow') {
        prediction = await mlPredictionEngine.predictWorkflowDuration(
          user.id,
          'content_creation'
        );
      }

      setPredictions([...predictions, { type, ...prediction }]);
      
      toast({
        title: 'Prediction Generated',
        description: `${type} prediction completed successfully`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate prediction',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Brain className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading AI personalization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            AI Personalization
          </h1>
          <p className="text-muted-foreground mt-1">
            Your personalized AI-powered insights and predictions
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">AI Personality</h3>
                <Badge variant="secondary">{profile?.aiPersonality}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Your AI assistant adapts to your preferred communication style
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Expertise Level</h3>
                <Badge variant="secondary">{profile?.expertiseLevel}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Content and suggestions tailored to your skill level
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Learning Style</h3>
                <Badge variant="secondary">{profile?.learningStyle}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Information presented in your preferred format
              </p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Personalization Score</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Profile Completeness</span>
                  <span className="text-muted-foreground">85%</span>
                </div>
                <Progress value={85} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Behavior Data</span>
                  <span className="text-muted-foreground">72%</span>
                </div>
                <Progress value={72} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Prediction Accuracy</span>
                  <span className="text-muted-foreground">68%</span>
                </div>
                <Progress value={68} />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Generate Predictions</h3>
            <div className="flex gap-4">
              <Button onClick={() => handleGeneratePrediction('content')}>
                Predict Content Performance
              </Button>
              <Button onClick={() => handleGeneratePrediction('workflow')} variant="outline">
                Predict Workflow Duration
              </Button>
            </div>
          </Card>

          {predictions.length > 0 && (
            <div className="space-y-4">
              {predictions.map((prediction, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge className="mb-2">{prediction.type}</Badge>
                      <h4 className="font-semibold">Prediction Results</h4>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Confidence: {Math.round((prediction.confidence || 0) * 100)}%
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(prediction).map(([key, value]) => {
                      if (key === 'type' || key === 'confidence') return null;
                      return (
                        <div key={key}>
                          <p className="text-sm text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="font-medium">
                            {typeof value === 'number' ? value.toLocaleString() : String(value)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-4">
            {recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <Card key={rec.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Target className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">{rec.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {rec.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">
                          {Math.round(rec.relevanceScore * 100)}% relevant
                        </Badge>
                        {rec.actionUrl && (
                          <Button variant="link" size="sm" className="p-0 h-auto">
                            Learn more →
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Recommendations Yet</h3>
                <p className="text-muted-foreground">
                  Keep using the platform to generate personalized recommendations
                </p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Personalization Settings</h3>
            <p className="text-muted-foreground">
              Customize how AI adapts to your workflow and preferences
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
