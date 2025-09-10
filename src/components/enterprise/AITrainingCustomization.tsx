import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Brain,
  Upload,
  Settings,
  BarChart3,
  Zap,
  Database,
  Target,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface TrainingDataset {
  id: string;
  name: string;
  size: number;
  status: 'processing' | 'ready' | 'training' | 'error';
  accuracy: number;
  createdAt: string;
}

interface CustomModel {
  id: string;
  name: string;
  baseModel: string;
  status: 'training' | 'ready' | 'deployed' | 'failed';
  accuracy: number;
  trainingProgress: number;
  useCase: string;
}

const MOCK_DATASETS: TrainingDataset[] = [
  {
    id: '1',
    name: 'Marketing Content Dataset',
    size: 15000,
    status: 'ready',
    accuracy: 94.2,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Technical Documentation',
    size: 8500,
    status: 'training',
    accuracy: 87.8,
    createdAt: '2024-01-18'
  }
];

const MOCK_MODELS: CustomModel[] = [
  {
    id: '1',
    name: 'Brand Voice Model',
    baseModel: 'GPT-4',
    status: 'deployed',
    accuracy: 96.5,
    trainingProgress: 100,
    useCase: 'Brand-consistent content generation'
  },
  {
    id: '2',
    name: 'Technical Writer',
    baseModel: 'Claude-3',
    status: 'training',
    accuracy: 89.2,
    trainingProgress: 65,
    useCase: 'Technical documentation and API guides'
  }
];

export const AITrainingCustomization: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [datasets, setDatasets] = useState<TrainingDataset[]>(MOCK_DATASETS);
  const [models, setModels] = useState<CustomModel[]>(MOCK_MODELS);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants = {
      processing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      training: 'bg-yellow-100 text-yellow-800',
      deployed: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Training & Customization
          </CardTitle>
          <CardDescription>
            Train custom AI models with your data for personalized content generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="datasets" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="datasets">Training Data</TabsTrigger>
              <TabsTrigger value="models">Custom Models</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="datasets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upload Training Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Dataset
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Training Datasets ({datasets.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {datasets.map((dataset) => (
                      <div key={dataset.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            <h4 className="font-medium">{dataset.name}</h4>
                            <Badge className={getStatusBadge(dataset.status)}>
                              {dataset.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Size:</span>
                            <p className="font-medium">{dataset.size.toLocaleString()} records</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Accuracy:</span>
                            <p className="font-medium">{dataset.accuracy}%</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Created:</span>
                            <p className="font-medium">{dataset.createdAt}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="models" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Custom Models ({models.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {models.map((model) => (
                      <div key={model.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            <h4 className="font-medium">{model.name}</h4>
                            <Badge className={getStatusBadge(model.status)}>
                              {model.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{model.useCase}</p>
                        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Base Model:</span>
                            <p className="font-medium">{model.baseModel}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Accuracy:</span>
                            <p className="font-medium">{model.accuracy}%</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <p className="font-medium capitalize">{model.status}</p>
                          </div>
                        </div>
                        {model.status === 'training' && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Training Progress</span>
                              <span>{model.trainingProgress}%</span>
                            </div>
                            <Progress value={model.trainingProgress} className="w-full" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-muted-foreground">Avg Accuracy</span>
                    </div>
                    <p className="text-2xl font-bold">92.8%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">Active Models</span>
                    </div>
                    <p className="text-2xl font-bold">{models.filter(m => m.status === 'deployed').length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-muted-foreground">Training Jobs</span>
                    </div>
                    <p className="text-2xl font-bold">{models.filter(m => m.status === 'training').length}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};