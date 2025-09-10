
import React from 'react';
import { motion } from 'framer-motion';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { VisualDataRenderer } from './VisualDataRenderer';
import { ModernActionButtons } from './ModernActionButtons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, User, Sparkles } from 'lucide-react';

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
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-5xl mx-auto`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className="h-10 w-10 border border-border/50">
          <AvatarFallback className={
            isUser 
              ? 'bg-gradient-to-br from-primary/20 to-blue-500/20' 
              : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
          }>
            {isUser ? (
              <User className="h-5 w-5 text-primary" />
            ) : (
              <Sparkles className="h-5 w-5 text-primary" />
            )}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Message Content */}
      <div className={`flex-1 space-y-4 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Progress Indicator */}
        {message.progressIndicator && !isUser && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
              Step {message.progressIndicator.currentStep} of {message.progressIndicator.totalSteps}
            </Badge>
            <span>{message.progressIndicator.stepName}</span>
            <div className="flex-1 bg-border/50 rounded-full h-1 max-w-[100px]">
              <div 
                className="bg-gradient-to-r from-primary to-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(message.progressIndicator.currentStep / message.progressIndicator.totalSteps) * 100}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Main Message */}
        <Card className={`p-4 max-w-4xl backdrop-blur-xl ${
          isUser 
            ? 'bg-gradient-to-br from-primary/10 to-blue-500/10 border-primary/20 ml-auto' 
            : 'bg-background/60 border-border/50'
        }`}>
          {/* Text Content */}
          <div className="prose prose-sm max-w-none">
            {message.content.split('\n').map((line, i) => (
              <p key={i} className={`text-sm leading-relaxed mb-2 last:mb-0 ${
                isUser ? 'text-primary-foreground' : 'text-foreground'
              }`}>
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
        {message.actions && message.actions.length > 0 && !isUser && (
          <div className="flex flex-wrap gap-2">
            <ModernActionButtons 
              actions={message.actions}
              onAction={onAction}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};
