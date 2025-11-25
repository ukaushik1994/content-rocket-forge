import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GlassCard } from '@/components/ui/GlassCard';
import { MessageInput } from '@/components/ai-chat/MessageInput';
import { CampaignMessageBubble } from './CampaignMessageBubble';
import { StrategySummaryCards } from './StrategySummaryCards';
import { ServiceStatusBar, ServiceStatus } from './ServiceStatusBar';
import { ChannelSelector } from './ChannelSelector';
import { useCampaignConversation } from '@/hooks/useCampaignConversation';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { CampaignInput as CampaignInputType, CampaignStrategySummary } from '@/types/campaign-types';
import { ArrowLeft, Target, Users, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CampaignChatInterfaceProps {
  initialMessage?: string;
  onComplete: (input: CampaignInputType, selectedSummary?: CampaignStrategySummary) => void;
  onCancel: () => void;
}

export function CampaignChatInterface({ 
  initialMessage, 
  onComplete, 
  onCancel
}: CampaignChatInterfaceProps) {
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({ type: 'idle' });

  const handleStatusUpdate = (
    type: 'serp-analyzing' | 'serp-complete' | 'serp-error' | 'ai-generating' | 'ai-complete' | 'ai-error',
    data?: { message?: string; provider?: string; count?: number }
  ) => {
    switch (type) {
      case 'serp-analyzing':
        setServiceStatus({ type: 'serp-analyzing', message: data?.message || '' });
        break;
      case 'serp-complete':
        setServiceStatus({ type: 'serp-complete', message: data?.message || '' });
        setTimeout(() => setServiceStatus({ type: 'idle' }), 3000);
        break;
      case 'serp-error':
        setServiceStatus({ type: 'serp-error', message: data?.message || '' });
        setTimeout(() => setServiceStatus({ type: 'idle' }), 5000);
        break;
      case 'ai-generating':
        setServiceStatus({ 
          type: 'ai-generating', 
          provider: data?.provider || 'AI', 
          message: data?.message || '' 
        });
        break;
      case 'ai-complete':
        setServiceStatus({ 
          type: 'ai-complete', 
          count: data?.count || 0, 
          message: data?.message || '' 
        });
        setTimeout(() => setServiceStatus({ type: 'idle' }), 3000);
        break;
      case 'ai-error':
        setServiceStatus({ type: 'ai-error', message: data?.message || '' });
        setTimeout(() => setServiceStatus({ type: 'idle' }), 5000);
        break;
    }
  };

  const {
    messages,
    stage,
    progress,
    processUserResponse,
    getCampaignInput,
    isComplete,
    isLoading,
    strategySummaries,
    selectedSummaryId,
    selectSummary,
    regenerateSummaries,
    goBackToStage,
    showChannelSelector,
    selectChannels
  } = useCampaignConversation(initialMessage, handleStatusUpdate);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Debug logging for state changes
  useEffect(() => {
    console.log('[Campaign UI] Messages updated:', messages.length);
    console.log('[Campaign UI] Current stage:', stage);
    console.log('[Campaign UI] Is complete:', isComplete);
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      console.log('[Campaign UI] Last message:', lastMsg.role, lastMsg.content.substring(0, 50));
    }
  }, [messages, stage, isComplete]);

  // Trigger completion when ready
  useEffect(() => {
    if (isComplete) {
      const input = getCampaignInput();
      const selectedStrategy = strategySummaries.find(s => s.id === selectedSummaryId);
      if (input && selectedStrategy) {
        setTimeout(() => {
          onComplete(input, selectedStrategy as any); // Cast to match expected type
        }, 1500);
      }
    }
  }, [isComplete, getCampaignInput, onComplete, selectedSummaryId, strategySummaries]);

  const handleSendMessage = (message: string) => {
    processUserResponse(message);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto"
    >
      <GlassCard className="relative p-6 space-y-6 bg-background/40 backdrop-blur-xl border-primary/20 shadow-[0_8px_32px_0_rgba(139,92,246,0.15)]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {!isComplete && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Step {progress.current} of {progress.total}
              </span>
              <div className="w-32">
                <Progress value={progress.percentage} className="h-2" />
              </div>
            </div>
          )}
        </div>

        {/* Service Status Indicator */}
        <ServiceStatusBar status={serviceStatus} />

        {/* Messages Area */}
        <div className="min-h-[400px] max-h-[600px] overflow-y-auto space-y-4 pr-2">
          <AnimatePresence>
            {messages.map((message, index) => (
              <ErrorBoundary
                key={message.id}
                FallbackComponent={() => (
                  <div className="text-red-500 text-sm p-2 border border-red-500/20 rounded">
                    Failed to render message
                  </div>
                )}
              >
                <CampaignMessageBubble
                  message={message}
                  isLatest={index === messages.length - 1}
                />
              </ErrorBoundary>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Strategy Summary Selection - Only show when complete AND strategies exist */}
        {stage === 'complete' && strategySummaries.length > 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6"
          >
            <StrategySummaryCards
              strategies={strategySummaries}
              selectedId={selectedSummaryId || ''}
              onSelect={selectSummary}
              onRegenerate={regenerateSummaries}
              onEditAnswers={() => goBackToStage('collecting')}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {/* Channel Selector - Show when contextually relevant */}
        {showChannelSelector && stage === 'collecting' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4"
          >
            <ChannelSelector onSelect={selectChannels} />
          </motion.div>
        )}

        {/* Message Input - Hide when complete or generating */}
        {stage === 'collecting' && !isLoading && (
          <MessageInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Tell me about your campaign idea, audience, goals, and timeline..."
          />
        )}

        {/* Loading State - Only show during generation */}
        {(stage === 'generating' || (stage === 'complete' && strategySummaries.length === 0 && isLoading)) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 space-y-4"
          >
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-3 w-3 rounded-full bg-primary"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Generating your campaign strategies...
            </p>
          </motion.div>
        )}
      </GlassCard>
    </motion.div>
  );
}
