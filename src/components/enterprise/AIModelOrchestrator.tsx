import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, DollarSign, TrendingUp, Settings, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'local';
  type: 'chat' | 'completion' | 'embedding' | 'image';
  costPerToken: number;
  maxTokens: number;
  capabilities: string[];
  performance: {
    speed: number;
    accuracy: number;
    creativity: number;
  };
  status: 'active' | 'inactive' | 'error';
  usage: {
    totalTokens: number;
    totalCost: number;
    avgResponseTime: number;
  };
}

interface ModelRecommendation {
  modelId: string;
  reason: string;
  confidence: number;
  estimatedCost: number;
}

const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    type: 'chat',
    costPerToken: 0.00003,
    maxTokens: 128000,
    capabilities: ['reasoning', 'coding', 'creative_writing', 'analysis'],
    performance: { speed: 85, accuracy: 95, creativity: 90 },
    status: 'active',
    usage: { totalTokens: 125000, totalCost: 3.75, avgResponseTime: 2.1 }
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    type: 'chat',
    costPerToken: 0.000015,
    maxTokens: 200000,
    capabilities: ['reasoning', 'analysis', 'writing', 'research'],
    performance: { speed: 75, accuracy: 98, creativity: 85 },
    status: 'active',
    usage: { totalTokens: 98000, totalCost: 1.47, avgResponseTime: 2.8 }
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    type: 'chat',
    costPerToken: 0.00001,
    maxTokens: 100000,
    capabilities: ['multimodal', 'reasoning', 'coding'],
    performance: { speed: 90, accuracy: 88, creativity: 82 },
    status: 'active',
    usage: { totalTokens: 45000, totalCost: 0.45, avgResponseTime: 1.6 }
  }
];

export const AIModelOrchestrator: React.FC = () => {
  const [models, setModels] = useState<AIModel[]>(AVAILABLE_MODELS);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4-turbo');
  const [autoSelection, setAutoSelection] = useState(true);
  const [recommendations, setRecommendations] = useState<ModelRecommendation[]>([]);
  const { toast } = useToast();

  const generateRecommendations = (taskType: string, complexity: 'low' | 'medium' | 'high') => {
    const recs: ModelRecommendation[] = [];
    
    models.forEach(model => {
      let score = 0;
      let reason = '';
      
      if (taskType === 'creative_writing') {
        score = model.performance.creativity * 0.6 + model.performance.accuracy * 0.4;
        reason = `High creativity score (${model.performance.creativity}) ideal for creative tasks`;
      } else if (taskType === 'analysis') {
        score = model.performance.accuracy * 0.7 + model.performance.speed * 0.3;
        reason = `Superior accuracy (${model.performance.accuracy}) for analytical work`;
      } else if (taskType === 'coding') {
        score = model.performance.accuracy * 0.5 + model.performance.speed * 0.5;
        reason = `Balanced accuracy and speed for coding tasks`;
      }
      
      if (complexity === 'high') {
        score *= (model.maxTokens / 100000);
        reason += '. Large context window for complex tasks';
      }
      
      const estimatedTokens = complexity === 'high' ? 5000 : complexity === 'medium' ? 2000 : 500;
      const estimatedCost = estimatedTokens * model.costPerToken;
      
      recs.push({
        modelId: model.id,
        reason,
        confidence: Math.min(score, 100),
        estimatedCost
      });
    });
    
    return recs.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  };

  const switchModel = async (modelId: string, reason?: string) => {
    setSelectedModel(modelId);
    toast({
      title: 'Model Switched',
      description: `Now using ${models.find(m => m.id === modelId)?.name}${reason ? ` - ${reason}` : ''}`,
    });
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return '🤖';
      case 'anthropic': return '🧠';
      case 'google': return '🔍';
      case 'local': return '🏠';
      default: return '⚡';
    }
  };

  const totalCost = models.reduce((acc, model) => acc + model.usage.totalCost, 0);
  const totalTokens = models.reduce((acc, model) => acc + model.usage.totalTokens, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Model Orchestrator</h2>
          <p className="text-muted-foreground">Intelligent model selection and cost optimization</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={autoSelection ? 'default' : 'secondary'}>
            {autoSelection ? 'Auto Selection' : 'Manual'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoSelection(!autoSelection)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Toggle Auto Selection
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalTokens / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">Processed tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.filter(m => m.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Ready to use</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">Model Management</TabsTrigger>
          <TabsTrigger value="optimization">Cost Optimization</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Selection</CardTitle>
              <CardDescription>Active model for AI operations</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedModel} onValueChange={switchModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {models.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <span>{getProviderIcon(model.provider)}</span>
                        <span>{model.name}</span>
                        <Badge variant="outline" className="ml-2">
                          ${(model.costPerToken * 1000).toFixed(3)}/1K tokens
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map(model => (
              <Card key={model.id} className={model.id === selectedModel ? 'ring-2 ring-primary' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getProviderIcon(model.provider)}
                      {model.name}
                    </CardTitle>
                    <Badge variant={model.status === 'active' ? 'default' : 'secondary'}>
                      {model.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {model.provider.toUpperCase()} • {model.maxTokens.toLocaleString()} tokens
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Speed</span>
                      <span>{model.performance.speed}%</span>
                    </div>
                    <Progress value={model.performance.speed} className="h-1" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span>{model.performance.accuracy}%</span>
                    </div>
                    <Progress value={model.performance.accuracy} className="h-1" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Creativity</span>
                      <span>{model.performance.creativity}%</span>
                    </div>
                    <Progress value={model.performance.creativity} className="h-1" />
                  </div>

                  <div className="pt-2 border-t text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Usage:</span>
                      <span>${model.usage.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Response:</span>
                      <span>{model.usage.avgResponseTime}s</span>
                    </div>
                  </div>

                  {model.id !== selectedModel && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => switchModel(model.id)}
                    >
                      Switch to this model
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Smart Recommendations</CardTitle>
              <CardDescription>AI-powered model selection for optimal cost and performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline"
                  onClick={() => setRecommendations(generateRecommendations('creative_writing', 'medium'))}
                >
                  Creative Writing
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setRecommendations(generateRecommendations('analysis', 'high'))}
                >
                  Data Analysis
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setRecommendations(generateRecommendations('coding', 'medium'))}
                >
                  Code Generation
                </Button>
              </div>

              {recommendations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Recommended Models:</h4>
                  {recommendations.map((rec, index) => {
                    const model = models.find(m => m.id === rec.modelId);
                    return (
                      <div key={rec.modelId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant={index === 0 ? 'default' : 'secondary'}>
                            #{index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">{model?.name}</p>
                            <p className="text-sm text-muted-foreground">{rec.reason}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Confidence: {rec.confidence.toFixed(0)}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Est. cost: ${rec.estimatedCost.toFixed(3)}
                          </p>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => switchModel(rec.modelId, rec.reason)}
                        >
                          Use This
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {models.map(model => (
                    <div key={model.id} className="flex justify-between items-center">
                      <span className="text-sm">{model.name}</span>
                      <div className="text-right">
                        <span className="font-medium">${model.usage.totalCost.toFixed(2)}</span>
                        <div className="text-xs text-muted-foreground">
                          {((model.usage.totalCost / totalCost) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {models.map(model => (
                    <div key={model.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{model.name}</span>
                        <span>{model.usage.avgResponseTime}s avg</span>
                      </div>
                      <Progress 
                        value={Math.max(0, 100 - (model.usage.avgResponseTime * 20))} 
                        className="h-1"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};