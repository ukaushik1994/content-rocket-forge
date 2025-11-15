import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GlassCard } from '@/components/ui/GlassCard';
import { MessageInput } from '@/components/ai-chat/MessageInput';
import { MessageBubble } from '@/components/ai-chat/MessageBubble';
import { useCampaignConversation } from '@/hooks/useCampaignConversation';
import { CampaignInput as CampaignInputType } from '@/types/campaign-types';
import { ArrowLeft, Target, Users, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CampaignChatInterfaceProps {
  initialMessage?: string;
  onComplete: (input: CampaignInputType) => void;
  onCancel: () => void;
}

export function CampaignChatInterface({ 
  initialMessage, 
  onComplete, 
  onCancel 
}: CampaignChatInterfaceProps) {
  const {
    messages,
    stage,
    progress,
    processUserResponse,
    handleQuickReply,
    getCampaignInput,
    isComplete
  } = useCampaignConversation(initialMessage);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Trigger completion when ready
  useEffect(() => {
    if (isComplete) {
      const input = getCampaignInput();
      if (input) {
        setTimeout(() => {
          onComplete(input);
        }, 1500);
      }
    }
  }, [isComplete, getCampaignInput, onComplete]);

  const handleSendMessage = (message: string) => {
    processUserResponse(message);
  };

  const quickReplies = {
    goal: [
      { label: 'Brand Awareness', value: 'awareness', icon: Target },
      { label: 'Conversions', value: 'conversion', icon: Target },
      { label: 'Engagement', value: 'engagement', icon: Users },
      { label: 'Education', value: 'education', icon: Users }
    ],
    timeline: [
      { label: '1 Week', value: '1-week', icon: Calendar },
      { label: '2 Weeks', value: '2-week', icon: Calendar },
      { label: '4 Weeks', value: '4-week', icon: Calendar },
      { label: 'Ongoing', value: 'ongoing', icon: Calendar }
    ]
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

        {/* Messages Area */}
        <div className="min-h-[400px] max-h-[600px] overflow-y-auto space-y-4 pr-2">
          <AnimatePresence>
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={{
                  id: message.id,
                  role: message.role,
                  content: message.content,
                  timestamp: message.timestamp
                }}
                isLatest={index === messages.length - 1}
              />
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reply Buttons */}
        {!isComplete && (stage === 'goal' || stage === 'timeline') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {quickReplies[stage].map((reply) => {
              const Icon = reply.icon;
              return (
                <Button
                  key={reply.value}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickReply(reply.value as any)}
                  className="gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/10"
                >
                  <Icon className="h-4 w-4" />
                  {reply.label}
                </Button>
              );
            })}
          </motion.div>
        )}

        {/* Message Input */}
        {!isComplete && (
          <MessageInput
            onSendMessage={handleSendMessage}
            isLoading={false}
            placeholder={
              stage === 'idea' 
                ? "Describe your campaign idea..." 
                : stage === 'audience'
                ? "Who are you trying to reach?"
                : stage === 'goal'
                ? "What's your main goal?"
                : "How much time do you have?"
            }
          />
        )}

        {/* Loading State */}
        {isComplete && (
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
