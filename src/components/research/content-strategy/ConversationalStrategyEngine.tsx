import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MessageSquare, 
  Brain, 
  Target, 
  Search, 
  BarChart3, 
  Link2, 
  Rocket,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { conversationalStrategyService, ConversationState } from '@/services/conversationalStrategyService';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';

const STEP_ICONS = {
  1: Brain,
  2: Target,
  3: Search,
  4: BarChart3,
  5: Link2,
  6: Rocket
};

const STEP_DESCRIPTIONS = [
  { step: 1, name: 'Context Setting', description: 'Understanding Your Business' },
  { step: 2, name: 'Goal Analysis', description: 'Analyzing Your Content Goals' },
  { step: 3, name: 'Keyword Discovery', description: 'Discovering Keyword Opportunities' },
  { step: 4, name: 'SERP Analysis', description: 'Analyzing Search Competition' },
  { step: 5, name: 'Solution Integration', description: 'Aligning with Your Solutions' },
  { step: 6, name: 'Strategy Assembly', description: 'Building Your Content Strategy' }
];

interface ConversationalStrategyEngineProps {
  goals: any;
  onComplete?: (strategy: any) => void;
}

export function ConversationalStrategyEngine({ goals, onComplete }: ConversationalStrategyEngineProps) {
  const [conversationState, setConversationState] = useState<ConversationState>({
    conversation: null,
    steps: [],
    currentStepData: null,
    isProcessing: false
  });
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const { refreshData } = useContentStrategy();

  const startConversation = async () => {
    setConversationState(prev => ({ ...prev, isProcessing: true, error: undefined }));
    
    try {
      // Get context data
      const { companyContext, solutionsContext } = await conversationalStrategyService.getContextData();
      
      // Start conversation
      const result = await conversationalStrategyService.startConversation(
        goals,
        companyContext,
        solutionsContext
      );

      setConversationState({
        conversation: result.conversation,
        steps: [result.currentStep],
        currentStepData: result.currentStep.ai_output,
        isProcessing: false
      });

      toast({
        title: "Conversation Started",
        description: "AI is analyzing your business context...",
      });

      // Auto-process next step
      setTimeout(() => processNextStep(result.conversation.id, result.currentStep.ai_output), 2000);

    } catch (error) {
      console.error('Error starting conversation:', error);
      setConversationState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: error instanceof Error ? error.message : 'Failed to start conversation'
      }));
      
      toast({
        title: "Error",
        description: "Failed to start AI conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const processNextStep = async (conversationId: string, stepData: any) => {
    setConversationState(prev => ({ ...prev, isProcessing: true }));

    try {
      const result = await conversationalStrategyService.processStep(conversationId, { 
        businessContext: stepData,
        refinedGoals: stepData?.refinedGoals || goals,
        keywords: stepData?.primaryKeywords || [],
        serpAnalysis: stepData,
        allPreviousSteps: conversationState.steps.map(s => s.ai_output)
      });

      // Update conversation state
      const updatedConversation = await conversationalStrategyService.getConversation(conversationId);
      
      setConversationState({
        conversation: updatedConversation.conversation,
        steps: updatedConversation.steps,
        currentStepData: result.stepResult?.ai_output || result.stepResult,
        isProcessing: false
      });

      if (result.isComplete) {
        toast({
          title: "Strategy Complete!",
          description: "Your conversational AI strategy has been generated successfully.",
        });
        
        refreshData();
        
        if (onComplete && result.stepResult?.finalStrategy) {
          onComplete(result.stepResult.finalStrategy);
        }
      } else {
        // Auto-process next step after delay
        setTimeout(() => processNextStep(conversationId, result.stepResult?.ai_output || result.stepResult), 3000);
      }

    } catch (error) {
      console.error('Error processing step:', error);
      setConversationState(prev => ({ 
        ...prev, 
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Failed to process step'
      }));
      
      toast({
        title: "Error",
        description: "Failed to process conversation step. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStepStatus = (stepNumber: number) => {
    const step = conversationState.steps.find(s => s.step_number === stepNumber);
    if (!step) return 'pending';
    return step.status;
  };

  const getStepIcon = (stepNumber: number) => {
    const IconComponent = STEP_ICONS[stepNumber as keyof typeof STEP_ICONS];
    const status = getStepStatus(stepNumber);
    
    if (status === 'completed') return CheckCircle2;
    if (status === 'processing') return RefreshCw;
    if (status === 'error') return AlertCircle;
    return IconComponent || Circle;
  };

  const progress = conversationState.conversation 
    ? (conversationState.conversation.current_step / conversationState.conversation.total_steps) * 100
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Conversational AI Strategy Engine
              </CardTitle>
              <CardDescription>
                Multi-step AI conversation for personalized content strategy generation
              </CardDescription>
            </div>
            <Badge variant={conversationState.conversation?.status === 'completed' ? 'default' : 'secondary'}>
              {conversationState.conversation?.status || 'Ready'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          {conversationState.conversation && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Conversation Progress</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Step Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {STEP_DESCRIPTIONS.map((stepDesc) => {
              const Icon = getStepIcon(stepDesc.step);
              const status = getStepStatus(stepDesc.step);
              const isActive = conversationState.conversation?.current_step === stepDesc.step;
              
              return (
                <motion.div
                  key={stepDesc.step}
                  className={`text-center p-3 rounded-lg border transition-all ${
                    status === 'completed' 
                      ? 'border-green-200 bg-green-50 text-green-700' 
                      : isActive
                      ? 'border-primary/20 bg-primary/5 text-primary'
                      : 'border-border bg-background text-muted-foreground'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <Icon className={`h-6 w-6 mx-auto mb-2 ${
                    status === 'processing' ? 'animate-spin' : ''
                  }`} />
                  <div className="text-xs font-medium">{stepDesc.name}</div>
                  <div className="text-xs opacity-70">{stepDesc.description}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Current Step Details */}
          <AnimatePresence>
            {conversationState.currentStepData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    Step {conversationState.conversation?.current_step}: Current Analysis
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? 'Hide' : 'Show'} Details
                  </Button>
                </div>
                
                {showDetails && (
                  <div className="text-sm space-y-2 text-muted-foreground">
                    <pre className="whitespace-pre-wrap bg-muted/30 p-3 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(conversationState.currentStepData, null, 2)}
                    </pre>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          {conversationState.error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg"
            >
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-sm mt-1 text-muted-foreground">{conversationState.error}</p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center pt-4">
            {!conversationState.conversation ? (
              <Button
                onClick={startConversation}
                disabled={conversationState.isProcessing}
                size="lg"
                className="min-w-48"
              >
                {conversationState.isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Starting Conversation...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start AI Conversation
                  </>
                )}
              </Button>
            ) : conversationState.conversation.status === 'completed' ? (
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Conversation Complete!</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your personalized content strategy has been generated.
                </p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-primary">
                  {conversationState.isProcessing ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                  <span className="font-medium">
                    {conversationState.isProcessing ? 'Processing...' : 'In Progress'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  AI is having a conversation to understand your needs better.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}