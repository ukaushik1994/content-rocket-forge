import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bot, RefreshCw, BarChart3, Sparkles, Search, FileText, HelpCircle, Users } from 'lucide-react';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { ContextualAction } from '@/services/aiService';
import { VisualDataRenderer } from './VisualDataRenderer';
import { ModernActionButtons } from './ModernActionButtons';
import { InlineProgress } from './InlineProgress';
import { SerpVisualData } from './SerpVisualData';
import { MessageStatus } from './MessageStatus';
import { ErrorMessageBubble } from './ErrorMessageBubble';
import { FormattedResponseRenderer } from './FormattedResponseRenderer';
import { MultiChartModal } from './MultiChartModal';
import { Button } from '@/components/ui/button';

interface EnhancedMessageBubbleProps {
  message: EnhancedChatMessage;
  isLatest?: boolean;
  onAction?: (action: ContextualAction) => void;
  onRetry?: () => void;
  isRetrying?: boolean;
  onSendMessage?: (message: string) => void; // For deep dive prompts
}

export const EnhancedMessageBubble: React.FC<EnhancedMessageBubbleProps> = ({
  message,
  isLatest,
  onAction,
  onRetry,
  isRetrying = false,
  onSendMessage
}) => {
  const [showMultiChartModal, setShowMultiChartModal] = useState(false);
  
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
        - Competitor analysis for: ${data.competitors?.map(c => c.title).join(', ')}
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
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      variants={bubbleVariants}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar (only for AI messages) */}
      {!isUser && (
        <motion.div 
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 border border-primary/30 flex-shrink-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
        >
          <Bot className="h-4 w-4 text-primary" />
        </motion.div>
      )}

      {/* Message Content */}
      <div className="max-w-md sm:max-w-xl lg:max-w-2xl">
        <div className="relative">
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

          {/* Message Content */}
          <Card className={`shadow-sm border backdrop-blur-sm ${
            isUser 
              ? 'bg-primary text-primary-foreground border-primary/20 ml-4 max-w-4xl' 
              : 'bg-background/80 border-border/50 mr-4 max-w-5xl'
          }`}>
            <div className="px-6 py-3">
              <div className={`text-sm leading-relaxed ${
                isUser ? 'text-primary-foreground' : 'text-foreground'
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

            {/* Message Tail */}
            <div className={`absolute top-4 ${
              isUser ? '-left-1' : '-right-1'
            } w-2 h-2 transform rotate-45 ${
              isUser 
                ? 'bg-primary border-r border-b border-primary/20' 
                : 'bg-background/80 border-l border-t border-border/50'
            }`} />
          </Card>

          {/* Visual Data Rendering */}
          {message.visualData && (
            <div className="mt-3">
              {(() => {
                console.log('🎨 EnhancedMessageBubble: Rendering visual data:', {
                  messageId: message.id,
                  visualDataType: message.visualData?.type,
                  hasChartConfig: !!message.visualData?.chartConfig,
                  hasMetrics: !!message.visualData?.metrics,
                  hasSerpData: !!message.visualData?.serpData,
                  fullVisualData: message.visualData,
                  allVisualDataCount: message.allVisualData?.length
                });
                return null;
              })()}
              
              {message.visualData.type === 'serp_analysis' && message.visualData.serpData && (
                <SerpVisualData 
                  serpData={message.visualData.serpData} 
                  onActionClick={(action, data) => {
                    console.log('🔄 SerpVisualData action clicked:', { action, data });
                    // Convert to contextual action and trigger
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
              )}
              <VisualDataRenderer data={message.visualData} />
            </div>
          )}

          {/* Show visual analysis card for ANY visual data */}
          {message.type === 'assistant' && (
            message.visualData || (message.allVisualData && message.allVisualData.length > 0)
          ) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 mb-3"
            >
              <div className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg border border-primary/20 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Visual Analysis Available
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {message.allVisualData?.length || 1} chart(s) • Interactive insights • Actionable recommendations
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowMultiChartModal(true)}
                    className="bg-primary hover:bg-primary/90 gap-2 shadow-lg"
                  >
                    <Sparkles className="w-4 h-4" />
                    View Insights
                  </Button>
                </div>
              </div>
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
              className="mt-4 space-y-3"
            >
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-semibold">SERP Analysis Results</h4>
              </div>
              
              {/* Keyword Metrics Cards */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-3 bg-gradient-to-br from-primary/10 to-transparent">
                  <div className="text-xs text-muted-foreground">Avg Search Volume</div>
                  <div className="text-2xl font-bold">
                    {(message.serpData as any).structured.aggregateMetrics.avgSearchVolume.toLocaleString()}
                  </div>
                </Card>
                <Card className="p-3 bg-gradient-to-br from-warning/10 to-transparent">
                  <div className="text-xs text-muted-foreground">Avg Difficulty</div>
                  <div className="text-2xl font-bold">
                    {(message.serpData as any).structured.aggregateMetrics.avgKeywordDifficulty}%
                  </div>
                </Card>
                <Card className="p-3 bg-gradient-to-br from-success/10 to-transparent">
                  <div className="text-xs text-muted-foreground">Competition</div>
                  <div className="text-2xl font-bold">
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
                    onClick={() => {
                      onSendMessage?.(`Show me content gaps for ${(message.serpData as any).keywords.join(', ')}`);
                    }}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    {(message.serpData as any).structured.aggregateMetrics.totalContentGaps} Content Gaps
                  </Button>
                )}
                {(message.serpData as any).structured.aggregateMetrics.totalQuestions > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
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
                  onClick={() => {
                    onSendMessage?.(`Who's ranking for ${(message.serpData as any).keywords.join(', ')}?`);
                  }}
                >
                  <Users className="w-3 h-3 mr-1" />
                  Top Competitors
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
        </div>

        {/* Timestamp */}
        <motion.div 
          className={`mt-1 px-1 text-xs text-muted-foreground ${
            isUser ? 'text-right' : 'text-left'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </motion.div>
      </div>

      {/* Avatar (only for user messages) */}
      {isUser && (
        <motion.div 
          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20 border border-secondary/30 flex-shrink-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
        >
          <User className="h-4 w-4 text-secondary" />
        </motion.div>
      )}

      {/* Multi-Chart Modal */}
      {(message.visualData || (message.allVisualData && message.allVisualData.length > 0)) && (
        <MultiChartModal
          isOpen={showMultiChartModal}
          onClose={() => setShowMultiChartModal(false)}
          allVisualData={message.allVisualData}
          currentChartConfig={message.visualData?.chartConfig}
          title={message.visualData?.title || 'Insights Hub'}
          description={message.visualData?.description}
          actionableItems={message.visualData?.actionableItems}
          deepDivePrompts={message.visualData?.deepDivePrompts}
          insights={(message as any).insights || []}
          context={(message as any).context || {}}
          onDeepDiveClick={(prompt) => {
            setShowMultiChartModal(false);
            onSendMessage?.(prompt);
          }}
          onActionClick={(action) => {
            onAction?.(action);
          }}
        />
      )}
    </motion.div>
  );
};