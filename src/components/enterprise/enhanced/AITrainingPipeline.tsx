import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Upload,
  Brain,
  Zap,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Download,
  Trash2,
  Eye,
  Settings
} from 'lucide-react';
import { useEnterpriseRBAC } from '@/contexts/EnterpriseRBACContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrainingDataset {
  id: string;
  name: string;
  description: string;
  fileType: 'csv' | 'json' | 'txt' | 'pdf';
  size: number;
  recordCount: number;
  uploadedAt: string;
  status: 'uploaded' | 'processing' | 'ready' | 'error';
  validationResults?: {
    isValid: boolean;
    issues: string[];
    quality: number;
  };
}

interface TrainingJob {
  id: string;
  name: string;
  datasetId: string;
  baseModel: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  hyperparameters: {
    learningRate: number;
    batchSize: number;
    epochs: number;
    temperature: number;
  };
  metrics?: {
    loss: number;
    accuracy: number;
    perplexity: number;
  };
  estimatedCost: number;
  actualCost?: number;
}

interface CustomModel {
  id: string;
  name: string;
  description: string;
  baseModel: string;
  trainingJobId: string;
  status: 'training' | 'ready' | 'deployed' | 'archived';
  metrics: {
    accuracy: number;
    f1Score: number;
    bleuScore?: number;
  };
  deploymentEndpoint?: string;
  createdAt: string;
  lastUsed?: string;
}

export const AITrainingPipeline: React.FC = () => {
  const { hasPermission, auditLog } = useEnterpriseRBAC();
  const [datasets, setDatasets] = useState<TrainingDataset[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [customModels, setCustomModels] = useState<CustomModel[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (hasPermission('ai_training', 'read')) {
      loadTrainingData();
    }
  }, [hasPermission]);

  const loadTrainingData = async () => {
    try {
      // Load datasets from database
      const { data: datasetData } = await supabase
        .from('training_datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (datasetData) {
        const formattedDatasets: TrainingDataset[] = datasetData.map(dataset => ({
          id: dataset.id,
          name: dataset.name,
          description: 'Training dataset',
          fileType: 'json' as any,
          size: dataset.size,
          recordCount: 1000,
          uploadedAt: dataset.created_at,
          status: dataset.status as any,
          validationResults: dataset.metadata ? JSON.parse(dataset.metadata as string) : undefined
        }));
        setDatasets(formattedDatasets);
      }

      // Load custom models from database  
      const { data: modelData } = await supabase
        .from('custom_models')
        .select('*')
        .order('created_at', { ascending: false });

      if (modelData) {
        const formattedModels: CustomModel[] = modelData.map(model => ({
          id: model.id,
          name: model.name,
          description: model.use_case || 'Custom AI model',
          baseModel: model.base_model,
          trainingJobId: model.dataset_id,
          status: model.status as any,
          metrics: {
            accuracy: model.accuracy,
            f1Score: 0.85,
            bleuScore: 0.78
          },
          deploymentEndpoint: undefined,
          createdAt: model.created_at,
          lastUsed: model.updated_at
        }));
        setCustomModels(formattedModels);
      }

      // Mock training jobs for now
      const mockJobs: TrainingJob[] = [
        {
          id: 'job-1',
          name: 'Content Classification Model',
          datasetId: 'dataset-1',
          baseModel: 'gpt-3.5-turbo',
          status: 'running',
          progress: 67,
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          hyperparameters: {
            learningRate: 0.0001,
            batchSize: 16,
            epochs: 10,
            temperature: 0.7
          },
          estimatedCost: 45.20
        }
      ];
      setTrainingJobs(mockJobs);

      await auditLog('training_data_loaded', 'ai_training', { 
        datasetCount: datasetData?.length || 0,
        modelCount: modelData?.length || 0 
      });
    } catch (error) {
      console.error('Error loading training data:', error);
      toast.error('Failed to load training data');
    }
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasPermission('ai_training', 'write')) {
      toast.error('You do not have permission to upload training data');
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('training-datasets')
        .upload(fileName, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) {
        throw uploadError;
      }

      // Create dataset record
      const { data: datasetRecord, error: dbError } = await supabase
        .from('training_datasets')
        .insert({
          name: file.name.replace(/\.[^/.]+$/, ""),
          size: file.size,
          status: 'uploaded',
          user_id: '00000000-0000-0000-0000-000000000000',
          metadata: JSON.stringify({
            file_type: file.type.includes('json') ? 'json' : file.type.includes('csv') ? 'csv' : 'txt',
            file_path: uploadData.path
          })
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      await auditLog('dataset_uploaded', 'ai_training', { 
        fileName: file.name,
        fileSize: file.size,
        datasetId: datasetRecord.id 
      });

      toast.success('Dataset uploaded successfully');
      loadTrainingData();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload dataset');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [hasPermission, auditLog]);

  const startTrainingJob = async (datasetId: string, config: any) => {
    if (!hasPermission('ai_training', 'write')) {
      toast.error('You do not have permission to start training jobs');
      return;
    }

    try {
      // Call edge function to start training
      const { data, error } = await supabase.functions.invoke('ai-training-pipeline', {
        body: {
          action: 'start_training',
          datasetId,
          config,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        throw error;
      }

      await auditLog('training_job_started', 'ai_training', { datasetId, config });
      toast.success('Training job started successfully');
      loadTrainingData();
    } catch (error) {
      console.error('Error starting training:', error);
      toast.error('Failed to start training job');
    }
  };

  const deployModel = async (modelId: string) => {
    if (!hasPermission('ai_training', 'deploy')) {
      toast.error('You do not have permission to deploy models');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-training-pipeline', {
        body: {
          action: 'deploy_model',
          modelId,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        throw error;
      }

      await auditLog('model_deployed', 'ai_training', { modelId });
      toast.success('Model deployed successfully');
      loadTrainingData();
    } catch (error) {
      console.error('Error deploying model:', error);
      toast.error('Failed to deploy model');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
      case 'completed':
      case 'deployed': return 'text-green-600';
      case 'running':
      case 'training': return 'text-blue-600';
      case 'queued':
      case 'uploaded': return 'text-yellow-600';
      case 'failed':
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
      case 'completed':
      case 'deployed': return CheckCircle;
      case 'running':
      case 'training': return Play;
      case 'failed':
      case 'error': return XCircle;
      default: return Clock;
    }
  };

  if (!hasPermission('ai_training', 'read')) {
    return (
      <Alert>
        <Brain className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to access the AI Training Pipeline.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Training Pipeline</h2>
          <p className="text-muted-foreground">
            Train and deploy custom AI models with your data
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{datasets.length}</p>
                <p className="text-xs text-muted-foreground">Training Datasets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{trainingJobs.filter(j => j.status === 'running').length}</p>
                <p className="text-xs text-muted-foreground">Active Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{customModels.length}</p>
                <p className="text-xs text-muted-foreground">Custom Models</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{customModels.filter(m => m.status === 'deployed').length}</p>
                <p className="text-xs text-muted-foreground">Deployed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="datasets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="datasets">Training Data</TabsTrigger>
          <TabsTrigger value="jobs">Training Jobs</TabsTrigger>
          <TabsTrigger value="models">Custom Models</TabsTrigger>
        </TabsList>

        <TabsContent value="datasets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Training Datasets</CardTitle>
                  <CardDescription>Upload and manage training data</CardDescription>
                </div>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".csv,.json,.txt,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button asChild disabled={isUploading}>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Dataset
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {datasets.map((dataset) => {
                  const StatusIcon = getStatusIcon(dataset.status);
                  return (
                    <div key={dataset.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(dataset.status)}`} />
                        <div>
                          <p className="font-medium">{dataset.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {dataset.fileType.toUpperCase()} • {(dataset.size / 1024 / 1024).toFixed(1)} MB • {dataset.recordCount} records
                          </p>
                          {dataset.validationResults && (
                            <p className="text-xs text-muted-foreground">
                              Quality: {dataset.validationResults.quality}%
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(dataset.status)}>
                          {dataset.status}
                        </Badge>
                        {dataset.status === 'ready' && (
                          <Button size="sm" onClick={() => startTrainingJob(dataset.id, {})}>
                            <Play className="mr-1 h-3 w-3" />
                            Train
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Jobs</CardTitle>
              <CardDescription>Monitor active and completed training jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingJobs.map((job) => {
                  const StatusIcon = getStatusIcon(job.status);
                  return (
                    <div key={job.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <StatusIcon className={`h-5 w-5 ${getStatusColor(job.status)}`} />
                          <div>
                            <p className="font-medium">{job.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Base Model: {job.baseModel}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                      
                      {job.status === 'running' && (
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{job.progress}%</span>
                          </div>
                          <Progress value={job.progress} />
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Learning Rate</p>
                          <p className="font-medium">{job.hyperparameters.learningRate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Batch Size</p>
                          <p className="font-medium">{job.hyperparameters.batchSize}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Epochs</p>
                          <p className="font-medium">{job.hyperparameters.epochs}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Estimated Cost</p>
                          <p className="font-medium">${job.estimatedCost}</p>
                        </div>
                      </div>

                      {job.metrics && (
                        <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Loss</p>
                            <p className="font-medium">{job.metrics.loss.toFixed(4)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Accuracy</p>
                            <p className="font-medium">{(job.metrics.accuracy * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Perplexity</p>
                            <p className="font-medium">{job.metrics.perplexity.toFixed(2)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Models</CardTitle>
              <CardDescription>Manage and deploy your trained models</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customModels.map((model) => {
                  const StatusIcon = getStatusIcon(model.status);
                  return (
                    <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(model.status)}`} />
                        <div>
                          <p className="font-medium">{model.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Based on {model.baseModel} • Created {new Date(model.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                            <span>Accuracy: {(model.metrics.accuracy * 100).toFixed(1)}%</span>
                            <span>F1 Score: {model.metrics.f1Score.toFixed(3)}</span>
                            {model.metrics.bleuScore && <span>BLEU: {model.metrics.bleuScore.toFixed(3)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(model.status)}>
                          {model.status}
                        </Badge>
                        {model.status === 'ready' && (
                          <Button size="sm" onClick={() => deployModel(model.id)}>
                            Deploy
                          </Button>
                        )}
                        {model.status === 'deployed' && model.deploymentEndpoint && (
                          <Button size="sm" variant="outline">
                            <Eye className="mr-1 h-3 w-3" />
                            View API
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};