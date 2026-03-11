import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Bot, User, RefreshCw, Search, FileText, HelpCircle, Users } from 'lucide-react';
import { EnhancedChatMessage, ChartConfiguration } from '@/types/enhancedChat';
import { ContextualAction } from '@/services/aiService';
import { ModernActionButtons } from './ModernActionButtons';
import { InlineProgress } from './InlineProgress';
import { SerpVisualData } from './SerpVisualData';
import { MessageStatus } from './MessageStatus';
import { ErrorMessageBubble } from './ErrorMessageBubble';
import { FormattedResponseRenderer } from './FormattedResponseRenderer';
import { Button } from '@/components/ui/button';
import { ThinkingIndicator } from './ThinkingIndicator';
import { MessageActions } from './MessageActions';
import { ActionResultCard, parseActionResults } from './ActionResultCard';
import { ActionConfirmationCard } from './ActionConfirmationCard';
import { CapabilitiesCard } from './CapabilitiesCard';
import { VisualDataRenderer } from './VisualDataRenderer';
import { ContentCreationChoiceCard } from './ContentCreationChoiceCard';
import { useNavigate } from 'react-router-dom';

interface EnhancedMessageBubbleProps {
  message: EnhancedChatMessage;
  isLatest?: boolean;
  onAction?: (action: ContextualAction) => void;
  onRetry?: () => void;
  isRetrying?: boolean;
  onSendMessage?: (message: string) => void;
  thinkingContent?: string;
  isThinking?: boolean;
  onExpandVisualization?: (visualData: any, chartConfig: ChartConfiguration) => void;
  onEditMessage?: (messageId: string, newContent: string) => Promise<void>;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  onConfirmAction?: (confirmationMsgId: string) => void;
  onCancelAction?: (confirmationMsgId: string) => void;
  onSetVisualization?: (visualData: any) => void;
}

export const EnhancedMessageBubble: React.FC<EnhancedMessageBubbleProps> = ({
  message,
  isLatest,
  onAction,
  onRetry,
  isRetrying = false,
  onSendMessage,
  thinkingContent,
  isThinking = false,
  onExpandVisualization,
  onEditMessage,
  onDeleteMessage,
  onConfirmAction,
  onCancelAction,
  onSetVisualization
}) => {
  const [showTimestamp, setShowTimestamp] = useState(false);
  const navigate = useNavigate();

  // Detect action results in assistant messages
  const actionResults = useMemo(() => {
    if (message.role !== 'assistant') return [];
    return parseActionResults(message.content);
  }, [message.role, message.content]);

  // Delayed timestamp reveal
  React.useEffect(() => {
    const timer = setTimeout(() => setShowTimestamp(true), 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Check if this is an error message
  if (message.messageStatus === 'error' && onRetry) {
    return (
      <ErrorMessageBubble
        message={message}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    );
  }

  const isUser = message.role === 'user';

  // Helper function to generate prompts for SERP actions
  const getActionPrompt = (action: string, data: any): string => {
    switch (action) {
      case 'create-content-strategy':
        return `Create a comprehensive content strategy for "${data.keyword}" based on the SERP analysis. Include:
        - Content brief targeting ${data.searchVolume?.toLocaleString()} monthly searches
        - Strategy to compete against difficulty level ${data.difficulty}%
        - Content gaps to address: ${data.contentGaps?.join(', ') || 'competitive analysis needed'}
        - Opportunities in: ${Object.entries(data.opportunities || {}).map(([key, values]) => `${key} (${Array.isArray(values) ? values.length : 0} keywords)`).join(', ')}`;
        
      case 'analyze-competitors':
        return `Analyze the top competitors for "${data.keyword}" and provide actionable insights:
        - Competitor analysis for: ${data.competitors?.map((c: any) => c.title).join(', ')}
        - Search volume context: ${data.searchVolume?.toLocaleString()} monthly searches
        - Competition level: ${data.difficulty}% difficulty
        - Provide content gaps, backlink opportunities, and competitive advantages to pursue`;
        
      case 'explore-related-keywords':
        return `Expand keyword research for "${data.keyword}" with related opportunities:
        - Base keyword: ${data.searchVolume?.toLocaleString()} monthly searches
        - Related keywords to analyze: ${data.relatedKeywords?.join(', ')}
        - Low competition opportunities: ${data.opportunities?.lowCompetition?.join(', ')}
        - High volume opportunities: ${data.opportunities?.highVolume?.join(', ')}
        - Trending keywords: ${data.opportunities?.trending?.join(', ')}`;
        
      default:
        return `Help me with ${action} for keyword "${data.keyword}"`;
    }
  };

  const bubbleVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      className={`group flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar (only for AI messages) */}
      {!isUser && (
         <motion.div 
           className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent border border-border/20 flex-shrink-0"
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ delay: 0.1, duration: 0.2 }}
         >
           <Bot className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      )}

      {/* Message Content - Responsive widths */}
      <div className={isUser 
        ? 'max-w-[85%] sm:max-w-[75%] lg:max-w-[60%]' 
        : 'w-full max-w-4xl'
      }>
        <div className="relative">
          {/* Thinking Indicator - shown while AI is processing */}
          {!isUser && isThinking && thinkingContent && (
            <ThinkingIndicator
              thinkingText={thinkingContent}
              isActive={isThinking}
            />
          )}

          {/* AI Processing Indicator */}
          {message.progressIndicator && (
            <InlineProgress
              workflowTitle={message.progressIndicator.workflowTitle}
              currentStep={message.progressIndicator.currentStep}
              totalSteps={message.progressIndicator.totalSteps}
              stepName={message.progressIndicator.stepName}
              progress={message.progressIndicator.progress}
              isActive={message.progressIndicator.isActive}
            />
          )}

          {/* Confirmation Card - rendered instead of normal message */}
          {!isUser && message.confirmationData && (
            <ActionConfirmationCard
              toolName={message.confirmationData.toolName}
              originalMessage={message.confirmationData.originalMessage}
              onConfirm={() => onConfirmAction?.(message.id)}
              onCancel={() => onCancelAction?.(message.id)}
            />
          )}

          {/* Capabilities Card */}
          {!isUser && message.content === '__CAPABILITIES_CARD__' && (
            <Card className="bg-transparent border border-border/20 mr-4 p-4">
              <CapabilitiesCard onTryExample={(ex) => onSendMessage?.(ex)} />
            </Card>
          )}

          {/* Normal Message Content - Premium Minimal Styling */}
          {!message.confirmationData && message.content !== '__CAPABILITIES_CARD__' && (
            <Card className={`relative ${
               isUser 
                 ? 'bg-primary/15 text-foreground border border-primary/25 ml-4' 
                 : 'bg-transparent border border-border/20 mr-4'
             }`}>
              <div className="px-6 py-4">
                <div className={`text-sm leading-relaxed ${
                  isUser ? 'text-foreground' : 'text-foreground'
                }`}>
                  {isUser ? (
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  ) : (
                    <FormattedResponseRenderer 
                      content={message.content} 
                      hasVisualData={!!message.visualData}
                    />
                  )}
                </div>
              </div>
              
              {/* Message Actions (Edit/Delete/Copy) */}
              <div className="absolute top-2 right-2">
                <MessageActions
                  messageId={message.id}
                  content={message.content}
                  isUser={isUser}
                  timestamp={message.timestamp}
                  onEdit={onEditMessage}
                  onDelete={onDeleteMessage}
                />
              </div>
            </Card>
          )}

          {/* Action Result Cards - structured success/failure rendering */}
          {!isUser && actionResults.length > 0 && (
            <div className="mt-3 space-y-2">
              {actionResults.map((result, idx) => (
                <ActionResultCard
                  key={idx}
                  result={result}
                  onNavigate={(url) => navigate(url)}
                  onFollowUp={(msg) => onSendMessage?.(msg)}
                />
              ))}
            </div>
          )}
          {/* SERP Data still renders inline as it's different from chart visualizations */}
          {message.visualData?.type === 'serp_analysis' && message.visualData.serpData && (
            <motion.div 
              className="mt-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <SerpVisualData 
                serpData={message.visualData.serpData} 
                onActionClick={(action, data) => {
                  onAction?.({
                    id: `serp-action-${Date.now()}`,
                    type: 'button',
                    label: action,
                    action: 'send_message',
                    data: { 
                      message: getActionPrompt(action, data)
                    }
                  });
                }}
              />
            </motion.div>
          )}

          {/* Content creation choice card - inline two-button UI */}
          {!isUser && message.visualData?.type === 'content_creation_choice' && onSetVisualization && (
            <ContentCreationChoiceCard
              keyword={(message.visualData as any).keyword || ''}
              onStartFromScratch={() => {
                onSetVisualization({
                  type: 'content_wizard',
                  keyword: (message.visualData as any).keyword || '',
                  solution_id: (message.visualData as any).solution_id,
                  content_type: (message.visualData as any).content_type
                });
              }}
              onAIProposals={() => {
                onSetVisualization({
                  type: 'proposal_browser',
                  keyword: (message.visualData as any).keyword || '',
                });
              }}
            />
          )}

          {/* Inline visualization for tool results (charts, metrics, dashboards) */}
          {!isUser && message.visualData && message.visualData.type !== 'serp_analysis' && message.visualData.type !== 'content_creation_choice' && (
            <motion.div 
              className="mt-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <VisualDataRenderer 
                data={message.visualData} 
                onAction={(action, data) => {
                  if (action.startsWith('navigate:')) {
                    navigate(action.replace('navigate:', ''));
                  } else if (action.startsWith('send:')) {
                    onSendMessage?.(action.replace('send:', ''));
                  } else {
                    onAction?.({
                      id: `visual-action-${Date.now()}`,
                      type: 'button',
                      label: action,
                      action,
                      data
                    });
                  }
                }}
                onExpandVisualization={onExpandVisualization}
              />
            </motion.div>
          )}

          {/* Action Buttons */}
          {message.actions && message.actions.length > 0 && (
            <ModernActionButtons 
              actions={message.actions} 
              onAction={onAction || (() => {})} 
            />
          )}

          {/* SERP Data Visualization */}
          {message.serpData && typeof message.serpData === 'object' && 'structured' in message.serpData && message.serpData.structured && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 space-y-3"
            >
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-medium">SERP Analysis</h4>
              </div>
              
              {/* Keyword Metrics Cards - Cleaner */}
              <div className="grid grid-cols-3 gap-3">
                 <Card className="p-3 bg-transparent border-border/20">
                   <div className="text-xs text-muted-foreground">Avg Volume</div>
                   <div className="text-xl font-bold text-foreground">
                     {(message.serpData as any).structured.aggregateMetrics.avgSearchVolume.toLocaleString()}
                   </div>
                 </Card>
                 <Card className="p-3 bg-transparent border-border/20">
                   <div className="text-xs text-muted-foreground">Difficulty</div>
                   <div className="text-xl font-bold text-foreground">
                     {(message.serpData as any).structured.aggregateMetrics.avgKeywordDifficulty}%
                   </div>
                 </Card>
                 <Card className="p-3 bg-transparent border-border/20">
                   <div className="text-xs text-muted-foreground">Competition</div>
                  <div className="text-xl font-bold text-foreground">
                    {(message.serpData as any).structured.aggregateMetrics.avgCompetitionScore}%
                  </div>
                </Card>
              </div>
              
              {/* Quick Actions for SERP */}
              <div className="flex gap-2 flex-wrap">
                {(message.serpData as any).structured.aggregateMetrics.totalContentGaps > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                     className="border-border/20 hover:border-border/40 hover:bg-muted/30"
                     onClick={() => {
                       onSendMessage?.(`Show me content gaps for ${(message.serpData as any).keywords.join(', ')}`);
                     }}
                   >
                     <FileText className="w-3 h-3 mr-1" />
                     {(message.serpData as any).structured.aggregateMetrics.totalContentGaps} Gaps
                   </Button>
                 )}
                 {(message.serpData as any).structured.aggregateMetrics.totalQuestions > 0 && (
                   <Button
                     size="sm"
                     variant="outline"
                     className="border-border/20 hover:border-border/40 hover:bg-muted/30"
                     onClick={() => {
                       onSendMessage?.(`What are people asking about ${(message.serpData as any).keywords.join(', ')}?`);
                     }}
                   >
                     <HelpCircle className="w-3 h-3 mr-1" />
                     {(message.serpData as any).structured.aggregateMetrics.totalQuestions} Questions
                   </Button>
                 )}
                 <Button
                   size="sm"
                   variant="outline"
                   className="border-border/20 hover:border-border/40 hover:bg-muted/30"
                  onClick={() => {
                    onSendMessage?.(`Who's ranking for ${(message.serpData as any).keywords.join(', ')}?`);
                  }}
                >
                  <Users className="w-3 h-3 mr-1" />
                  Competitors
                </Button>
              </div>
            </motion.div>
          )}

          {/* Retry Button for AI messages */}
          {!isUser && onRetry && (
            <div className="mt-3 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                disabled={isRetrying}
                className="h-7 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Retry'}
              </Button>
            </div>
          )}

          {/* User message status */}
          {isUser && (
            <MessageStatus 
              status={message.messageStatus === 'error' ? 'failed' : (message.messageStatus as 'sent' | 'delivered' | 'read' | 'failed') || 'sent'}
              timestamp={message.timestamp}
            />
          )}

          {/* Timestamp for assistant messages - Delayed fade in */}
          {!isUser && (
            <AnimatePresence>
              {showTimestamp && (
                <motion.div 
                  className="mt-1.5 px-1 text-xs text-muted-foreground/60 text-left"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Avatar (only for user messages) */}
      {isUser && (
        <motion.div 
           className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/25 flex-shrink-0"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          <User className="h-4 w-4 text-secondary-foreground" />
        </motion.div>
      )}

      {/* Visualizations now render in sidebar, not in modal */}
    </motion.div>
  );
};
