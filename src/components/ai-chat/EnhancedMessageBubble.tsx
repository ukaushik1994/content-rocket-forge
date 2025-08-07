
import React from 'react';
import { motion } from 'framer-motion';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { VisualDataRenderer } from './VisualDataRenderer';
import { ModernActionButtons } from './ModernActionButtons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
        <Avatar className="h-10 w-10 border border-border">
          <AvatarFallback className={
            isUser 
              ? 'bg-gradient-to-br from-neon-blue/20 to-cyan-500/20' 
              : 'bg-gradient-to-br from-neon-purple/20 to-neon-pink/20'
          }>
            {isUser ? (
              <User className="h-5 w-5 text-foreground" />
            ) : (
              <Sparkles className="h-5 w-5 text-foreground" />
            )}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Message Content */}
      <div className={`flex-1 space-y-4 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Progress Indicator */}
        {message.progressIndicator && !isUser && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs bg-accent/20 text-foreground border-border">
              Step {message.progressIndicator.currentStep} of {message.progressIndicator.totalSteps}
            </Badge>
            <span>{message.progressIndicator.stepName}</span>
            <div className="flex-1 bg-muted rounded-full h-1 max-w-[100px]">
              <div 
                className="bg-gradient-to-r from-neon-purple to-neon-blue h-1 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(message.progressIndicator.currentStep / message.progressIndicator.totalSteps) * 100}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Main Message */}
        <Card className={`p-4 max-w-4xl backdrop-blur-sm ${
          isUser 
            ? 'bg-card/70 border-border ml-auto' 
            : 'bg-card/70 border-border'
        }`}>
          {/* Text Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold mb-3 text-foreground border-b border-border pb-2">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold mb-2 mt-4 text-foreground">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold mb-2 mt-3 text-foreground">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-sm leading-relaxed mb-2 text-muted-foreground">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-sm text-muted-foreground">{children}</li>
                ),
                code: ({ children }) => (
                  <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                ),
                a: ({ children, href }) => (
                  <a href={href} className="story-link">{children}</a>
                ),
              }}
            >
              {message.content || ''}
            </ReactMarkdown>
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
