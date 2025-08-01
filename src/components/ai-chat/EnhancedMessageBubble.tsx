
import React from 'react';
import { motion } from 'framer-motion';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { VisualDataRenderer } from './VisualDataRenderer';
import { ActionButtons } from './ActionButtons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, User } from 'lucide-react';

interface EnhancedMessageBubbleProps {
  message: EnhancedChatMessage;
  isLatest: boolean;
  onAction: (action: string, data?: any) => void;
}

export const EnhancedMessageBubble: React.FC<EnhancedMessageBubbleProps> = ({
  message,
  isLatest,
  onAction
}) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-4xl mx-auto`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className="h-8 w-8 border border-white/20">
          <AvatarFallback className={isUser ? 'bg-primary/20' : 'bg-secondary/20'}>
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Message Content */}
      <div className={`flex-1 space-y-4 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Progress Indicator */}
        {message.progressIndicator && !isUser && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              Step {message.progressIndicator.currentStep} of {message.progressIndicator.totalSteps}
            </Badge>
            <span>{message.progressIndicator.stepName}</span>
            <div className="flex-1 bg-secondary/20 rounded-full h-1 max-w-[100px]">
              <div 
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(message.progressIndicator.currentStep / message.progressIndicator.totalSteps) * 100}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Main Message */}
        <Card className={`p-4 max-w-3xl ${
          isUser 
            ? 'bg-primary/10 border-primary/20 ml-auto' 
            : 'bg-white/5 border-white/10'
        } backdrop-blur-sm`}>
          {/* Text Content */}
          <div className="prose prose-invert max-w-none">
            {message.content.split('\n').map((line, i) => (
              <p key={i} className="text-sm leading-relaxed mb-2 last:mb-0">
                {line}
              </p>
            ))}
          </div>

          {/* Visual Data */}
          {message.visualData && !isUser && (
            <div className="mt-4">
              <VisualDataRenderer visualData={message.visualData} />
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        {message.actions && !isUser && (
          <div className="flex flex-wrap gap-2">
            <ActionButtons 
              actions={message.actions}
              onAction={onAction}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};
